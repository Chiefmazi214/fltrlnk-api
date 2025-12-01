import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { BusinessService } from '../src/business/business.service';
import { RoleService } from '../src/user/role.service';
import { AuthService } from '../src/auth/auth.service';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { BusinessType } from 'src/business/business.enum';

interface BusinessData {
  place_id?: string;
  'Business Name': string;
  'Business Address': string;
  'Business Phone Number': string;
  'Business Category': string;
  'Business Type': string;
  'Business Niche': string;
  'Business Characteristics': string;
  'Contact Email': string;
  website: string;
  website_scrape_status: string;
  enrichment_status: string;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  media_urls: string[];
  lat?: number;
  lng?: number;
  state?: string;
  keyword_searched?: string;
  error_message?: string | null;
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

interface ImportSummary {
  totalProcessed: number;
  successCount: number;
  partialSuccessCount: number;
  errorCount: number;
  skipCount: number;
  resultsPath: string;
  credentialsPath: string;
}

class BatchBusinessImporter {
  private userService: UserService;
  private businessService: BusinessService;
  private roleService: RoleService;
  private authService: AuthService;
  private businessRoleId: string;
  private batchSize: number = 100; // Process 50 businesses at a time
  private delayBetweenBatches: number = 3000; // 2 seconds delay between batches

  constructor(
    userService: UserService,
    businessService: BusinessService,
    roleService: RoleService,
    authService: AuthService,
  ) {
    this.userService = userService;
    this.businessService = businessService;
    this.roleService = roleService;
    this.authService = authService;
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

  private parseCoordinate(coord: any): number | null {
    if (coord === null || coord === undefined || coord === '') return null;

    const parsed = typeof coord === 'string' ? parseFloat(coord) : coord;
    return !isNaN(parsed) && isFinite(parsed) ? parsed : null;
  }

  private mapBusinessCategory(category: string): BusinessType {
    const categoryMap: Record<string, BusinessType> = {
      'FOOD & BEVERAGE': BusinessType.FOOD_AND_BEVERAGE,
      ACTIVITY: BusinessType.ACTIVITY,
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

    return `${cleanName}_${index}_${Date.now()}`;
  }

  private generatePassword(): string {
    return 'fltr123.';
  }

  private extractCityStateFromAddress(address: string): {
    city?: string;
    state?: string;
  } {
    const result: { city?: string; state?: string } = {};

    if (!address) return result;

    // Pattern: "City, State Abbr ZIP, Country"
    const parts = address.split(',');

    if (parts.length >= 3) {
      // Extract city (second to last part, before state)
      result.city = parts[parts.length - 3]?.trim();

      // Extract state (from the "State ZIP" part)
      const stateZipPart = parts[parts.length - 2]?.trim();
      if (stateZipPart) {
        const stateMatch = stateZipPart.match(/^([A-Z]{2})\s+\d{5}/);
        if (stateMatch) {
          result.state = stateMatch[1];
        }
      }
    }

    return result;
  }

  private normalizeEmail(email: any): string | null {
    // Handle various email formats
    if (!email) return null;

    // If it's an array
    if (Array.isArray(email)) {
      if (email.length === 0) return null;
      // Get the first valid email from array
      const validEmail = email.find(
        (e) => e && typeof e === 'string' && e.includes('@'),
      );
      return validEmail || null;
    }

    // If it's a string
    if (typeof email === 'string') {
      const trimmed = email.trim();
      return trimmed && trimmed.includes('@') ? trimmed : null;
    }

    return null;
  }

  private parseAttributes(characteristics: any): string[] {
    if (!characteristics || characteristics === null) return [];

    if (typeof characteristics === 'string') {
      return characteristics
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
    }

    if (Array.isArray(characteristics)) {
      return characteristics
        .filter((c) => typeof c === 'string')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
    }

    return [];
  }

  private sanitizeString(value: any): string | undefined {
    if (!value || value === null) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
  }

  private sanitizeUrl(url: any): string | undefined {
    if (!url || url === null) return undefined;
    if (typeof url === 'string') {
      const trimmed = url.trim();
      // Basic URL validation
      if (
        trimmed.length > 0 &&
        (trimmed.startsWith('http://') ||
          trimmed.startsWith('https://') ||
          trimmed.includes('.'))
      ) {
        return trimmed;
      }
    }
    return undefined;
  }

  private async processBusiness(
    business: BusinessData,
    index: number,
  ): Promise<ImportResult> {
    try {
      // Validate required fields
      if (!business['Business Name']) {
        return {
          success: false,
          businessName: 'Unknown Business',
          error: 'Missing business name - skipped',
        };
      }

      const businessName =
        this.sanitizeString(business['Business Name']) || 'Unknown Business';

      // Skip if enrichment failed (optional check)
      if (
        business.enrichment_status === 'failed_no_text_or_error_page' ||
        business.enrichment_status === 'failed'
      ) {
        return {
          success: false,
          businessName: businessName,
          error: 'Enrichment failed - skipped',
        };
      }

      // Normalize email field
      const normalizedEmail = this.normalizeEmail(business['Contact Email']);
      const normalizedPhone = this.sanitizeString(
        business['Business Phone Number'],
      );

      // Check if user already exists by email (only if we have a valid email)
      if (normalizedEmail) {
        try {
          let existingUser = null;
          if (normalizedPhone) {
            existingUser = await this.userService.getUserByPhoneOrEmail(
              normalizedPhone,
              normalizedEmail,
            );
          } else {
            existingUser =
              await this.userService.getUserByEmail(normalizedEmail);
          }

          if (existingUser) {
            return {
              success: false,
              businessName: businessName,
              error: 'User with this email already exists - skipped',
            };
          }
        } catch (emailCheckError) {
          // Continue if email check fails
          console.log(
            `Email check failed for ${normalizedEmail}, continuing...`,
          );
        }
      }

      // Generate credentials
      const username = this.generateUsername(businessName, index);
      const plainPassword = this.generatePassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      // Use normalized email or generate one
      const email = normalizedEmail || `${username}@business.local`;

      // Extract city and state from address
      const address = this.sanitizeString(business['Business Address']);
      const { city, state } = address
        ? this.extractCityStateFromAddress(address)
        : { city: undefined, state: undefined };

      // Parse coordinates
      const lat = this.parseCoordinate(business.lat);
      const lng = this.parseCoordinate(business.lng);

      // Parse attributes from Business Characteristics
      const attributes = this.parseAttributes(
        business['Business Characteristics'],
      );

      // Create user data with all sanitized fields
      const userData: any = {
        name: businessName,
        email: email,
        phone: this.sanitizeString(business['Business Phone Number']) + Math.floor(Math.random() * 10000).toString(),
        password: hashedPassword,
        displayName: businessName,
        username: username + Math.floor(Math.random() * 10000).toString(),
        profileType: 'business',
        emailVerified: true,
        phoneVerified: false,
        roles: [this.businessRoleId],
        attributes: attributes,
        social: {
          website: this.sanitizeUrl(business.website),
          instagram: this.sanitizeUrl(business.instagram_url),
          facebook: this.sanitizeUrl(business.facebook_url),
          linkedin: this.sanitizeUrl(business.linkedin_url),
          youtube: this.sanitizeUrl(business.youtube_url),
          tiktok: this.sanitizeUrl(business.tiktok_url),
        },
        // Add business-specific fields to user
        businessAddress: address,
        businessCity: city || undefined,
        businessState: state || this.sanitizeString(business.state),
        businessCategory: this.sanitizeString(business['Business Category']),
        businessType: this.sanitizeString(business['Business Type']),
        businessNiche: this.sanitizeString(business['Business Niche']),
        pregenerated: true,
      };

      // Add location if we have valid coordinates
      if (lat !== null && lng !== null) {
        userData.location = {
          type: 'Point',
          coordinates: [lng, lat], // MongoDB expects [longitude, latitude]
        };
      }

      // Create user
      let user;
      try {
        user = await this.userService.createUser(userData);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error
          const dupField = error.keyValue
            ? Object.keys(error.keyValue)[0]
            : 'field';
          return {
            success: false,
            businessName: businessName,
            error: `Duplicate ${dupField} - skipped`,
          };
        }
        // Log unexpected errors but don't fail the entire batch
        console.error(
          `Error creating user for ${businessName}:`,
          error.message,
        );
        return {
          success: false,
          businessName: businessName,
          error: `User creation failed: ${error.message}`,
        };
      }

      // Create business record with mapped and sanitized fields
      const businessRecord: any = {
        user: user._id,
        companyName: businessName,
        phone: this.sanitizeString(business['Business Phone Number']),
        website: this.sanitizeUrl(business.website),
        businessType: this.mapBusinessCategory(
          this.sanitizeString(business['Business Category']) ||
            'FOOD & BEVERAGE',
        ),
        category: this.sanitizeString(business['Business Type']) || 'general',
        state: state || this.sanitizeString(business.state),
        niche: this.sanitizeString(business['Business Niche']) || 'General',
        minPrice: undefined,
        maxPrice: undefined,
        mapDiscovery: true,
        pregenerated: true,
        // Add default bios
        miniProfileBio: `Welcome to ${businessName}`,
        radarProfileBio:
          attributes.length > 0
            ? attributes.join(', ')
            : `Discover ${businessName}`,
        workingHours: {
          monday: { open: '09:00', close: '18:00', isClosed: false },
          tuesday: { open: '09:00', close: '18:00', isClosed: false },
          wednesday: { open: '09:00', close: '18:00', isClosed: false },
          thursday: { open: '09:00', close: '18:00', isClosed: false },
          friday: { open: '09:00', close: '18:00', isClosed: false },
          saturday: { open: '09:00', close: '18:00', isClosed: false },
          sunday: { open: '09:00', close: '18:00', isClosed: true },
        },
      };

      let createdBusiness;
      try {
        createdBusiness = await this.businessService.createBusiness(
          user._id.toString(),
          businessRecord,
        );
      } catch (businessError) {
        console.error(
          `Error creating business for ${businessName}:`,
          businessError.message,
        );
        // Business creation failed, but user was created - still count as partial success
        return {
          success: true,
          businessName: businessName,
          userId: user._id.toString(),
          businessId: undefined,
          credentials: { username, password: plainPassword },
          error: 'User created but business creation failed',
        };
      }

      return {
        success: true,
        businessName: businessName,
        userId: user._id.toString(),
        businessId: (createdBusiness as any)._id.toString(),
        credentials: { username, password: plainPassword },
      };
    } catch (error) {
      // Catch any unexpected errors
      console.error(
        `Unexpected error processing ${business['Business Name'] || 'unknown'}:`,
        error,
      );
      return {
        success: false,
        businessName: business['Business Name'] || 'Unknown Business',
        error: error.message || 'Unknown error',
      };
    }
  }

  async importBusinessData(
    filePath: string,
    startIndex: number = 0,
    endIndex?: number,
  ): Promise<ImportSummary> {
    console.log('Starting batch business data import...');

    // Read and parse JSON file
    const rawData = fs.readFileSync(filePath, 'utf8');
    const businessData: BusinessData[] = JSON.parse(rawData);

    const totalRecords = businessData.length;
    const actualEndIndex = endIndex || totalRecords;
    const recordsToProcess = businessData.slice(startIndex, actualEndIndex);

    console.log(
      `Processing records ${startIndex + 1} to ${actualEndIndex} of ${totalRecords}`,
    );
    console.log(`Batch size: ${this.batchSize}`);

    const results: ImportResult[] = [];
    let successCount = 0;
    let partialSuccessCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    // Process in batches
    for (let i = 0; i < recordsToProcess.length; i += this.batchSize) {
      const batch = recordsToProcess.slice(i, i + this.batchSize);
      const batchNumber = Math.floor(i / this.batchSize) + 1;
      const totalBatches = Math.ceil(recordsToProcess.length / this.batchSize);

      console.log(`\n=== Processing Batch ${batchNumber}/${totalBatches} ===`);
      console.log(
        `Records ${startIndex + i + 1} to ${startIndex + i + batch.length}`,
      );

      // Process batch
      const batchPromises = batch.map((business, batchIndex) =>
        this.processBusiness(business, startIndex + i + batchIndex),
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Count results
      const batchSuccess = batchResults.filter(
        (r) => r.success && r.businessId,
      ).length;
      const batchPartial = batchResults.filter(
        (r) => r.success && !r.businessId,
      ).length;
      const batchErrors = batchResults.filter((r) => !r.success);
      const batchSkipped = batchResults.filter(
        (r) => !r.success && r.error?.includes('skipped'),
      ).length;

      successCount += batchSuccess;
      partialSuccessCount += batchPartial;
      errorCount += batchErrors.length;
      skipCount += batchSkipped;

      if (batchErrors.length > 0) {
        // INSERT_YOUR_CODE
        // Show up to 5 random sample errors from the batch
        const errorSamples = batchErrors.map((e) => e.error).filter(Boolean);

        if (errorSamples.length > 0) {
          // Shuffle errors and pick up to 5
          const shuffled = errorSamples
            .map((e) => ({ e, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ e }) => e)
            .slice(0, 5);

          console.log('  Sample errors:');
          shuffled.forEach((err, idx) => {
            console.log(`    ${idx + 1}. ${err}`);
          });
        }
      }

      console.log(
        `Batch ${batchNumber} completed: ${batchSuccess} full success, ${batchPartial} partial, ${batchErrors.length} errors (${batchSkipped} skipped)`,
      );

      // Show sample success if any
      const successSample = batchResults.find((r) => r.success);
      if (successSample) {
        console.log(
          `  Sample: ${successSample.businessName} created successfully`,
        );
      }

      // Delay between batches (except for the last batch)
      if (i + this.batchSize < recordsToProcess.length) {
        console.log(
          `Waiting ${this.delayBetweenBatches}ms before next batch...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, this.delayBetweenBatches),
        );
      }
    }

    // Save results to file with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const resultsPath = path.join(
      process.cwd(),
      'scripts',
      `import-results-${timestamp}.json`,
    );
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

    // Save credentials to separate file
    const credentials = results
      .filter((r) => r.success && r.credentials)
      .map((r) => ({
        businessName: r.businessName,
        username: r.credentials!.username,
        password: r.credentials!.password,
        userId: r.userId,
        businessId: r.businessId,
        hasBusinessRecord: !!r.businessId,
      }));

    const credentialsPath = path.join(
      process.cwd(),
      'scripts',
      `business-credentials-${timestamp}.json`,
    );
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));

    // Group errors by type
    const errorGroups: Record<string, number> = {};
    results
      .filter((r) => !r.success || (r.success && r.error))
      .forEach((r) => {
        const errorType = r.error || 'Unknown error';
        errorGroups[errorType] = (errorGroups[errorType] || 0) + 1;
      });

    console.log('\n=== Final Import Summary ===');
    console.log(`Total processed: ${recordsToProcess.length}`);
    console.log(`Fully successful: ${successCount} (user + business created)`);
    console.log(
      `Partially successful: ${partialSuccessCount} (only user created)`,
    );
    console.log(`Failed: ${errorCount - skipCount}`);
    console.log(`Skipped: ${skipCount}`);
    console.log(
      `Success rate: ${(((successCount + partialSuccessCount) / recordsToProcess.length) * 100).toFixed(2)}%`,
    );

    // Show error breakdown
    if (Object.keys(errorGroups).length > 0) {
      console.log('\n=== Error/Warning Breakdown ===');
      Object.entries(errorGroups)
        .sort((a, b) => b[1] - a[1])
        .forEach(([error, count]) => {
          console.log(`  ${error}: ${count}`);
        });
    }

    console.log(`\nResults saved to: ${resultsPath}`);
    console.log(`Credentials saved to: ${credentialsPath}`);

    // Show some sample errors
    const errors = results
      .filter((r) => !r.success && !r.error?.includes('skipped'))
      .slice(0, 5);
    if (errors.length > 0) {
      console.log('\nSample errors (first 5):');
      errors.forEach((error) =>
        console.log(`  - ${error.businessName}: ${error.error}`),
      );
    }

    // Show partial successes if any
    const partials = results
      .filter((r) => r.success && !r.businessId)
      .slice(0, 3);
    if (partials.length > 0) {
      console.log('\nPartial successes (user created, business failed):');
      partials.forEach((partial) =>
        console.log(`  - ${partial.businessName}: ${partial.error}`),
      );
    }

    return {
      totalProcessed: recordsToProcess.length,
      successCount,
      partialSuccessCount,
      errorCount,
      skipCount,
      resultsPath,
      credentialsPath,
    };
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const businessService = app.get(BusinessService);
  const roleService = app.get(RoleService);
  const authService = app.get(AuthService);

  const importer = new BatchBusinessImporter(
    userService,
    businessService,
    roleService,
    authService,
  );

  try {
    await importer.initialize();

    // Default file path - change this to your actual file path
    const filePath = path.join(process.cwd(), 'scripts', 'combined_whole.json');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      console.log('Please ensure the JSON file exists at the specified path.');
      process.exit(1);
    }

    // Parse command line arguments
    // Usage: npm run import-businesses [startIndex] [endIndex]
    const startIndex = parseInt(process.argv[2]) || 0;
    const endIndex = parseInt(process.argv[3]) || undefined;

    console.log('\n=== Import Configuration ===');
    console.log(`File: ${filePath}`);
    console.log(`Start Index: ${startIndex}`);
    console.log(`End Index: ${endIndex || 'All remaining records'}`);
    console.log('=============================\n');

    const result = await importer.importBusinessData(
      filePath,
      startIndex,
      endIndex,
    );

    // Exit with appropriate code
    const realErrors = result.errorCount - result.skipCount;
    if (realErrors > 0) {
      console.log(`\n⚠️  Import completed with ${realErrors} errors`);
      if (result.partialSuccessCount > 0) {
        console.log(
          `   Note: ${result.partialSuccessCount} users were created without business records`,
        );
      }
      process.exit(0);
    } else if (result.partialSuccessCount > 0) {
      console.log(
        `\n⚠️  Import completed with ${result.partialSuccessCount} partial successes`,
      );
      console.log('   (Users created but business records failed)');
      process.exit(0);
    } else {
      console.log('\n✅ Import completed successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run only if this is the main module
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { BatchBusinessImporter };
