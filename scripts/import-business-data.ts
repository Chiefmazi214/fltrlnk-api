import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { BusinessService } from '../src/business/business.service';
import { RoleService } from '../src/user/role.service';
import { AttachmentService } from '../src/attachment/attachment.service';
import { BusinessType } from '../src/business/models/business.model';
import { AttachmentType } from '../src/attachment/models/attachment.model';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

interface BusinessData {
  'Business Name': string;
  'Business City': string;
  'Business State': string;
  'Business Address': string;
  'Business Category': string;
  'Business Type': string;
  'Business Phone Number': string;
  'Contact Email': string;
  website: string;
  website_scrape_status: string;
  media_urls: string[];
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  'Business Niche': string;
  'Business Characteristics': string;
  enrichment_status: string;
  lat: any;
  lng: any;
}

class BusinessDataImporter {
  private userService: UserService;
  private businessService: BusinessService;
  private roleService: RoleService;
  private attachmentService: AttachmentService;
  private businessRoleId: string;

  constructor(
    userService: UserService,
    businessService: BusinessService,
    roleService: RoleService,
    attachmentService: AttachmentService,
  ) {
    this.userService = userService;
    this.businessService = businessService;
    this.roleService = roleService;
    this.attachmentService = attachmentService;
  }

  async initialize() {
    // Get or create business role
    const businessRole = await this.roleService.getRoleByName('BUSINESS');
    if (!businessRole) {
      throw new Error('Business role not found. Please create it first.');
    }
    this.businessRoleId = businessRole._id.toString();
  }

  private mapBusinessCategory(category: string): BusinessType {
    const categoryMap: Record<string, BusinessType> = {
      'FOOD & BEVERAGE': BusinessType.FOOD_AND_BEVERAGE,
      ACTIVITY: BusinessType.ACTIVITY,
      'NIGHT LIFE': BusinessType.NIGHT_LIFE,
      'HAIR & BEAUTY': BusinessType.HAIR_AND_BEAUTY,
      'BODY & WELLNESS': BusinessType.BODY_AND_WELLNESS,
    };

    return categoryMap[category] || BusinessType.ACTIVITY;
  }

  private async geocodeAddress(
    address: string,
  ): Promise<{ longitude: number; latitude: number } | null> {
    // TODO: Implement geocoding service (Google Maps API, OpenStreetMap, etc.)
    // For now, return null - you'll need to implement this
    console.log(`Geocoding address: ${address}`);
    return null;
  }

  private generateUsername(businessName: string, index: number): string {
    // Clean business name and create unique username
    const cleanName = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);

    return `${cleanName}_${index}`;
  }

  private async generatePassword(): Promise<string> {
    // Use consistent password for all business accounts
    // return 'fltr123.';

    const newPassword = 'fltr123.';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    return hashedPassword;
  }

  private getFileExtension(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Extract extension manually since path.extname might have issues
      const lastDotIndex = pathname.lastIndexOf('.');
      if (lastDotIndex !== -1 && lastDotIndex < pathname.length - 1) {
        return pathname.substring(lastDotIndex);
      }
      return '.jpg'; // Default to .jpg if no extension
    } catch {
      return '.jpg';
    }
  }

  private async createMediaAttachment(
    mediaUrl: string,
    businessName: string,
    user: any,
    index: number,
  ): Promise<any> {
    try {
      console.log(`Creating attachment for media URL: ${mediaUrl}`);

      // Get file extension from URL
      const extension = this.getFileExtension(mediaUrl);

      // Create a filename based on the URL
      const filename = `${businessName.replace(/[^a-zA-Z0-9]/g, '_')}_media_${index}${extension}`;

      // Create attachment record with type DOCUMENT
      // Store the original URL directly without downloading
      const attachment = await this.attachmentService.createAttachment({
        filename: filename,
        path: mediaUrl, // Store the original URL as the path
        type: AttachmentType.DOCUMENT,
        user: user._id, // Use the user's ObjectId instead of the full user object
        url: mediaUrl, // Store the original URL as the public URL
      });

      console.log(`Created attachment: ${attachment._id} for URL: ${mediaUrl}`);
      return attachment;
    } catch (error) {
      console.error(
        `Failed to create attachment for media ${mediaUrl}:`,
        error.message,
      );
      return null;
    }
  }

  async importBusinessData(filePath: string) {
    console.log('Starting business data import...');

    // Read and parse JSON file
    const rawData = fs.readFileSync(filePath, 'utf8');
    const businessData: BusinessData[] = JSON.parse(rawData);

    console.log(`Found ${businessData.length} business records to import`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < businessData.length; i++) {
      const business = businessData[i];

      try {
        console.log(
          `Processing business ${i + 1}/${businessData.length}: ${business['Business Name']}`,
        );

        // Skip if enrichment failed
        if (business.enrichment_status === 'failed_no_text_or_error_page') {
          console.log(
            `Skipping ${business['Business Name']} - enrichment failed`,
          );
          continue;
        }

        // Create user account for business
        const username = this.generateUsername(business['Business Name'], i);
        const password = await this.generatePassword();

        const userData: any = {
          name: business['Business Name'],
          email: business['Contact Email'] || `${username}@business.local`,
          phone: business['Business Phone Number'] || undefined,
          password: password,
          displayName: business['Business Name'],
          username: username,
          profileType: 'business',
          emailVerified: true,
          phoneVerified: false,
          attributes: business['Business Characteristics']
            ? business['Business Characteristics']
                .split(',')
                .map((a) => a.trim())
            : [],
          social: {
            website: business.website || undefined,
            instagram: business.instagram_url || undefined,
            facebook: business.facebook_url || undefined,
            linkedin: business.linkedin_url || undefined,
            youtube: business.youtube_url || undefined,
            tiktok: business.tiktok_url || undefined,
          },
          location: {
            type: 'Point',
            coordinates: [business.lng, business.lat],
          },
          businessAddress: business['Business Address'],
          businessCity: business['Business City'],
          businessState: business['Business State'],
          businessCategory: this.mapBusinessCategory(business['Business Category']),
          businessType: business['Business Type'],
          businessNiche: business['Business Niche'],
        };

        // Geocode address for location
        // const coordinates = await this.geocodeAddress(
        //   business['Business Address'],
        // );
        // if (coordinates) {
        //   userData.location = {
        //     type: 'Point',
        //     coordinates: [coordinates.longitude, coordinates.latitude],
        //   };
        // }

        // Create user
        const user = await this.userService.createUser(userData);
        console.log(`Created user: ${user._id}`);

        // Create business record
        const businessRecord = {
          companyName: business['Business Name'],
          phone: business['Business Phone Number'] || undefined,
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
            sunday: { open: '09:00', close: '18:00', isClosed: true },
          },
          businessType: this.mapBusinessCategory(business['Business Category']), // Use the mapped enum value
        };

        const createdBusiness = await this.businessService.createBusiness(
          user._id.toString(),
          businessRecord,
        );
        console.log(`Created business: ${(createdBusiness as any)._id}`);
        console.log(`Business details:`, JSON.stringify(createdBusiness, null, 2));

        // Process media attachments if available
        if (business.media_urls && business.media_urls.length > 0) {
          console.log(
            `Processing ${business.media_urls.length} media attachments for ${business['Business Name']}`,
          );

          const attachmentPromises = business.media_urls.map(
            (mediaUrl: string, index: number) =>
              this.createMediaAttachment(
                mediaUrl,
                business['Business Name'],
                user,
                index,
              ),
          );

          const attachments = await Promise.all(attachmentPromises);
          const successfulAttachments = attachments.filter(
            (att) => att !== null,
          );

          console.log(
            `Successfully created ${successfulAttachments.length}/${business.media_urls.length} attachment records`,
          );
          
          // Log details of successful attachments
          successfulAttachments.forEach((attachment, index) => {
            console.log(`Attachment ${index + 1}:`, {
              id: attachment._id,
              filename: attachment.filename,
              type: attachment.type,
              user: attachment.user,
              url: attachment.url
            });
          });
        }

        successCount++;

        // Log credentials for reference
        console.log(
          `Business credentials - Username: ${username}, Password: fltr123.`,
        );
      } catch (error) {
        errorCount++;
        const errorMsg = `Error processing ${business['Business Name']}: ${error.message}`;
        console.error(errorMsg);
        console.error('Full error details:', error);
        console.error('Stack trace:', error.stack);
        errors.push(errorMsg);
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total processed: ${businessData.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach((error) => console.log(`- ${error}`));
    }
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // used to create user in the db
  const userService = app.get(UserService);
  // used to create business information in the db
  const businessService = app.get(BusinessService);
  const roleService = app.get(RoleService);
  const attachmentService = app.get(AttachmentService);

  const importer = new BusinessDataImporter(
    userService,
    businessService,
    roleService,
    attachmentService,
  );

  try {
    await importer.initialize();

    const filePath = path.join(
      process.cwd(),
      'scripts/category_7',
      // 'FOOD_BEVERAGE.json'
      // 'NIGHT_LIFE.json',
      // 'HAIR_BEAUTY.json',
      // 'SERVICES.json'
      // 'filtered_data.json',
      // 'enriched_business_data_final.json',
      // 'FOOD_&_BEVERAGE.json'
      // 'FOOD___BEVERAGE.json'
      // done ....'ACTIVITY.json',
      // done.....
      // 'NIGHT_LIFE.json',
      // 'SERVICES.json',
      // 'HAIR___BEAUTY.json',
      'ACTIVITY.json'

    );
    await importer.importBusinessData(filePath);
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  main();
}

