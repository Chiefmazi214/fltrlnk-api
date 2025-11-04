import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { BusinessService } from '../src/business/business.service';
import { RoleService } from '../src/user/role.service';
import { AuthService } from '../src/auth/auth.service';
import { GeocodingService } from './geocoding.service';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { BusinessType } from 'src/business/business.enum';

interface BusinessData {
  "Business Name": string;
  "Business City": string;
  "Business State": string;
  "Business Address": string;
  "Business Category": string;
  "Business Type": string;
  "Business Phone Number": string;
  "Contact Email": string;
  website: string;
  website_scrape_status: string;
  media_urls: string[];
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  "Business Niche": string;
  "Business Characteristics": string;
  enrichment_status: string;
}

interface ImportResult {
  success: boolean;
  businessName: string;
  userId?: string;
  businessId?: string;
  error?: string;
  credentials?: {
    username: string;
    password: string;
  };
}

class BatchBusinessImporter {
  private userService: UserService;
  private businessService: BusinessService;
  private roleService: RoleService;
  private authService: AuthService;
  private geocodingService: GeocodingService;
  private businessRoleId: string;
  private batchSize: number = 50; // Process 50 businesses at a time
  private delayBetweenBatches: number = 2000; // 2 seconds delay between batches

  constructor(
    userService: UserService,
    businessService: BusinessService,
    roleService: RoleService,
    authService: AuthService,
    geocodingService: GeocodingService
  ) {
    this.userService = userService;
    this.businessService = businessService;
    this.roleService = roleService;
    this.authService = authService;
    this.geocodingService = geocodingService;
  }

  async initialize() {
    // Get or create business role
    const businessRole = await this.roleService.getRoleByName('BUSINESS');
    if (!businessRole) {
      throw new Error('Business role not found. Please create it first.');
    }
    this.businessRoleId = businessRole._id.toString();
    console.log(`Using business role ID: ${this.businessRoleId}`);
  }

  private mapBusinessCategory(category: string): BusinessType {
    const categoryMap: Record<string, BusinessType> = {
      'FOOD & BEVERAGE': BusinessType.FOOD_AND_BEVERAGE,
      'ACTIVITY': BusinessType.ACTIVITY,
      'NIGHT LIFE': BusinessType.NIGHT_LIFE,
      'HAIR & BEAUTY': BusinessType.HAIR_AND_BEAUTY,
      'BODY & WELLNESS': BusinessType.BODY_AND_WELLNESS,
    };
    
    return categoryMap[category] || BusinessType.FOOD_AND_BEVERAGE;
  }

  private generateUsername(businessName: string, index: number): string {
    const cleanName = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
    
    return `${cleanName}_${index}`;
  }

  private generatePassword(): string {
    return 'fltr123.';
  }

  private async processBusiness(business: BusinessData, index: number): Promise<ImportResult> {
    try {
      // Skip if enrichment failed
      if (business.enrichment_status === 'failed_no_text_or_error_page') {
        return {
          success: false,
          businessName: business["Business Name"],
          error: 'Enrichment failed - skipped'
        };
      }

      // Check if user already exists by email
      const existingUser = await this.userService.getUserByEmail(business["Contact Email"]);
      if (existingUser) {
        return {
          success: false,
          businessName: business["Business Name"],
          error: 'User already exists - skipped'
        };
      }

      // Generate credentials
      const username = this.generateUsername(business["Business Name"], index);
      const plainPassword = this.generatePassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      // Geocode address
      const coordinates = await this.geocodingService.geocodeAddress(business["Business Address"]);

      // Generate unique email if contact email is missing
      let email = business["Contact Email"];
      if (!email) {
        email = `${username}@business.local`;
      }

      // Create user data
      const userData: any = {
        name: business["Business Name"],
        email: email,
        phone: business["Business Phone Number"] || undefined,
        password: hashedPassword,
        displayName: business["Business Name"],
        username: username,
        profileType: 'business',
        emailVerified: true,
        phoneVerified: false,
        attributes: business["Business Characteristics"] ? 
          business["Business Characteristics"].split(',').map(a => a.trim()) : [],
        social: {
          website: business.website || undefined,
          instagram: business.instagram_url || undefined,
          facebook: business.facebook_url || undefined,
          linkedin: business.linkedin_url || undefined,
          youtube: business.youtube_url || undefined,
          tiktok: business.tiktok_url || undefined,
        }
      };

      // Add location if geocoded
      if (coordinates) {
        userData.location = {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        };
      }

      // Create user
      let user;
      try {
        user = await this.userService.createUser(userData);
      } catch (error) {
        if (error.code === 11000) { // Duplicate key error
          return {
            success: false,
            businessName: business["Business Name"],
            error: 'Duplicate email - skipped'
          };
        }
        throw error; // Re-throw other errors
      }

      // Create business record
      const businessRecord = {
        companyName: business["Business Name"],
        phone: business["Business Phone Number"] || undefined,
        website: business.website || undefined,
        minPrice: undefined,
        maxPrice: undefined,
        mapDiscovery: true,
        workingHours: {
          monday: { open: '09:00', close: '18:00', isClosed: false },
          tuesday: { open: '09:00', close: '18:00', isClosed: false },
          wednesday: { open: '09:00', close: '18:00', isClosed: false },
          thursday: { open: '09:00', close: '18:00', isClosed: false },
          friday: { open: '09:00', close: '18:00', isClosed: false },
          saturday: { open: '09:00', close: '18:00', isClosed: false },
          sunday: { open: '09:00', close: '18:00', isClosed: true }
        }
      };

      const createdBusiness = await this.businessService.createBusiness(user._id.toString(), businessRecord);

      return {
        success: true,
        businessName: business["Business Name"],
        userId: user._id.toString(),
        businessId: (createdBusiness as any)._id.toString(),
        credentials: { username, password: plainPassword }
      };

    } catch (error) {
      return {
        success: false,
        businessName: business["Business Name"],
        error: error.message
      };
    }
  }

  async importBusinessData(filePath: string, startIndex: number = 0, endIndex?: number) {
    console.log('Starting batch business data import...');
    
    // Read and parse JSON file
    const rawData = fs.readFileSync(filePath, 'utf8');
    const businessData: BusinessData[] = JSON.parse(rawData);
    
    const totalRecords = businessData.length;
    const actualEndIndex = endIndex || totalRecords;
    const recordsToProcess = businessData.slice(startIndex, actualEndIndex);
    
    console.log(`Processing records ${startIndex + 1} to ${actualEndIndex} of ${totalRecords}`);
    console.log(`Batch size: ${this.batchSize}`);
    
    const results: ImportResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Process in batches
    for (let i = 0; i < recordsToProcess.length; i += this.batchSize) {
      const batch = recordsToProcess.slice(i, i + this.batchSize);
      const batchNumber = Math.floor(i / this.batchSize) + 1;
      const totalBatches = Math.ceil(recordsToProcess.length / this.batchSize);
      
      console.log(`\n=== Processing Batch ${batchNumber}/${totalBatches} ===`);
      console.log(`Records ${startIndex + i + 1} to ${startIndex + i + batch.length}`);
      
      // Process batch
      const batchPromises = batch.map((business, batchIndex) => 
        this.processBusiness(business, startIndex + i + batchIndex)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Count results
      const batchSuccess = batchResults.filter(r => r.success).length;
      const batchErrors = batchResults.filter(r => !r.success).length;
      
      successCount += batchSuccess;
      errorCount += batchErrors;
      
      console.log(`Batch ${batchNumber} completed: ${batchSuccess} success, ${batchErrors} errors`);
      
      // Delay between batches (except for the last batch)
      if (i + this.batchSize < recordsToProcess.length) {
        console.log(`Waiting ${this.delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches));
      }
    }

    // Save results to file
    const resultsPath = path.join(process.cwd(), 'scripts', 'import-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    // Save credentials to separate file
    const credentials = results
      .filter(r => r.success && r.credentials)
      .map(r => ({
        businessName: r.businessName,
        username: r.credentials!.username,
        password: r.credentials!.password
      }));
    
    const credentialsPath = path.join(process.cwd(), 'scripts', 'business-credentials.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));

    console.log('\n=== Final Import Summary ===');
    console.log(`Total processed: ${recordsToProcess.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Success rate: ${((successCount / recordsToProcess.length) * 100).toFixed(2)}%`);
    console.log(`\nResults saved to: ${resultsPath}`);
    console.log(`Credentials saved to: ${credentialsPath}`);
    
    // Show some errors
    const errors = results.filter(r => !r.success).slice(0, 10);
    if (errors.length > 0) {
      console.log('\nFirst 10 errors:');
      errors.forEach(error => console.log(`- ${error.businessName}: ${error.error}`));
    }
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userService = app.get(UserService);
  const businessService = app.get(BusinessService);
  const roleService = app.get(RoleService);
  const authService = app.get(AuthService);
  const geocodingService = new GeocodingService();
  
  const importer = new BatchBusinessImporter(
    userService, 
    businessService, 
    roleService, 
    authService,
    geocodingService
  );
  
  try {
    await importer.initialize();
    
    const filePath = path.join(process.cwd(), 'scripts', 'enriched_business_data_final.json');
    
    // You can specify start and end indices for partial imports
    const startIndex = parseInt(process.argv[2]) || 0;
    const endIndex = parseInt(process.argv[3]) || undefined;
    
    await importer.importBusinessData(filePath, startIndex, endIndex);
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  main();
}
