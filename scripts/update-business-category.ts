import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { BusinessService } from "src/business/business.service";
import { UserService } from "src/user/user.service";
import * as fs from 'fs';
import * as path from 'path';
import { BusinessType } from "src/business/business.enum";

interface BusinessData {
  place_id: string;
  website?: string;
  "Business Name": string;
  "Business Phone Number": string;
  "Contact Email": string;
  "Business Category": string;
}

class BusinessCategoryUpdater {
  constructor(
    private businessService: BusinessService,
    private userService: UserService
  ) {}

  /**
   * Update businesses from SERVICES.json file to hair&beauty category
   */
  async updateBusinessCategory(filePath: string): Promise<{
    totalRecords: number;
    usersFound: number;
    updated: number;
    errors: string[];
  }> {
    const results = {
      totalRecords: 0,
      usersFound: 0,
      updated: 0,
      errors: [] as string[]
    };

    try {
      // Read and parse the JSON file
      console.log(`Reading business data from: ${filePath}`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const businessData: BusinessData[] = JSON.parse(fileContent);

      results.totalRecords = businessData.length;
      console.log(`Found ${results.totalRecords} businesses in ACTIVITY.json`);

      if (results.totalRecords === 0) {
        console.log('No businesses found in the JSON file');
        return results;
      }

      // Process each business record
      for (let i = 0; i < businessData.length; i++) {
        const business = businessData[i];
        console.log(`Processing ${i + 1}/${results.totalRecords}: ${business["Business Name"]}`);

        try {
          // Find user by email or phone
          const email = business["Contact Email"];
          const phone = business["Business Phone Number"];
          
          const user = await this.userService.getUserByPhoneOrEmail(phone, email);
          
          if (!user) {
            results.errors.push(`User not found for business: ${business["Business Name"]}`);
            continue;
          }

          results.usersFound++;

          // their is business category in user mode, i want to yupdate it accordingly

          // Find business by user ID and update category to hair&beauty
          const userBusiness = await this.businessService['businessRepository'].findOne({ user: user._id });
          
          if (!userBusiness) {
            results.errors.push(`No business profile found for user: ${business["Business Name"]}`);
            continue;
          }

          const updatedUser = await this.userService.updateUser(user._id.toString(), { businessCategory: BusinessType.ACTIVITY });

          const updatedBusiness = await this.businessService['businessRepository'].update(
            (userBusiness as any)._id.toString(),
            { businessType: BusinessType.ACTIVITY }
          );

          if (updatedBusiness) {
            results.updated++;
            console.log(`✅ Updated: ${business["Business Name"]} → ${BusinessType.ACTIVITY}`);
          } else {
            results.errors.push(`Failed to update business: ${business["Business Name"]}`);
          }

          // Add a small delay every 10 updates
          if ((i + 1) % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

        } catch (error) {
          const errorMsg = `Error processing ${business["Business Name"]}: ${error.message}`;
          results.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

    } catch (error) {
      results.errors.push(`File processing error: ${error.message}`);
      console.error('File processing error:', error);
    }

    return results;
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const businessService = app.get(BusinessService);
  const userService = app.get(UserService);
  const updater = new BusinessCategoryUpdater(businessService, userService);
  
  try {
    // Path to SERVICES.json file
    const filePath = path.join(
      process.cwd(),
      'scripts',
      'category_8',
      'ACTIVITY.json'
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }

    console.log('🚀 Starting business category update for ACTIVITY.json records');
    console.log('================================================================');
    
    const results = await updater.updateBusinessCategory(filePath);
    
    console.log('\n📊 === UPDATE RESULTS ===');
    console.log(`Total records in JSON: ${results.totalRecords}`);
    console.log(`Users found in database: ${results.usersFound}`);
    console.log(`Successfully updated: ${results.updated}`);
    console.log(`Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ === ERRORS ===');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n✅ Update process completed!');
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  main();
}
  