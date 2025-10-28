import * as fs from 'fs';
import * as path from 'path';

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

interface ValidationResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  categories: Record<string, number>;
  enrichmentStatus: Record<string, number>;
  missingFields: Record<string, number>;
  errors: string[];
}

class BusinessDataValidator {
  validateData(filePath: string): ValidationResult {
    console.log('Validating business data...');
    
    const rawData = fs.readFileSync(filePath, 'utf8');
    const businessData: BusinessData[] = JSON.parse(rawData);
    
    const result: ValidationResult = {
      totalRecords: businessData.length,
      validRecords: 0,
      invalidRecords: 0,
      categories: {},
      enrichmentStatus: {},
      missingFields: {},
      errors: []
    };

    businessData.forEach((business, index) => {
      const recordErrors: string[] = [];
      
      // Check required fields
      if (!business["Business Name"]) {
        recordErrors.push('Missing Business Name');
        result.missingFields["Business Name"] = (result.missingFields["Business Name"] || 0) + 1;
      }
      
      if (!business["Business Address"]) {
        recordErrors.push('Missing Business Address');
        result.missingFields["Business Address"] = (result.missingFields["Business Address"] || 0) + 1;
      }
      
      if (!business["Business Category"]) {
        recordErrors.push('Missing Business Category');
        result.missingFields["Business Category"] = (result.missingFields["Business Category"] || 0) + 1;
      }

      // Count categories
      if (business["Business Category"]) {
        result.categories[business["Business Category"]] = 
          (result.categories[business["Business Category"]] || 0) + 1;
      }

      // Count enrichment status
      if (business.enrichment_status) {
        result.enrichmentStatus[business.enrichment_status] = 
          (result.enrichmentStatus[business.enrichment_status] || 0) + 1;
      }

      // Check for valid email format
      if (business["Contact Email"] && !this.isValidEmail(business["Contact Email"])) {
        recordErrors.push('Invalid email format');
      }

      // Check for valid phone format
      if (business["Business Phone Number"] && !this.isValidPhone(business["Business Phone Number"])) {
        recordErrors.push('Invalid phone format');
      }

      // Check for valid website URL
      if (business.website && !this.isValidUrl(business.website)) {
        recordErrors.push('Invalid website URL');
      }

      if (recordErrors.length === 0) {
        result.validRecords++;
      } else {
        result.invalidRecords++;
        result.errors.push(`Record ${index + 1} (${business["Business Name"]}): ${recordErrors.join(', ')}`);
      }
    });

    return result;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  printValidationReport(result: ValidationResult) {
    console.log('\n=== Business Data Validation Report ===');
    console.log(`Total Records: ${result.totalRecords}`);
    console.log(`Valid Records: ${result.validRecords}`);
    console.log(`Invalid Records: ${result.invalidRecords}`);
    console.log(`Success Rate: ${((result.validRecords / result.totalRecords) * 100).toFixed(2)}%`);

    console.log('\n--- Business Categories ---');
    Object.entries(result.categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`${category}: ${count}`);
      });

    console.log('\n--- Enrichment Status ---');
    Object.entries(result.enrichmentStatus)
      .sort(([,a], [,b]) => b - a)
      .forEach(([status, count]) => {
        console.log(`${status}: ${count}`);
      });

    if (Object.keys(result.missingFields).length > 0) {
      console.log('\n--- Missing Fields ---');
      Object.entries(result.missingFields)
        .sort(([,a], [,b]) => b - a)
        .forEach(([field, count]) => {
          console.log(`${field}: ${count} missing`);
        });
    }

    if (result.errors.length > 0) {
      console.log('\n--- Sample Errors (first 10) ---');
      result.errors.slice(0, 10).forEach(error => {
        console.log(`- ${error}`);
      });
      
      if (result.errors.length > 10) {
        console.log(`... and ${result.errors.length - 10} more errors`);
      }
    }

    console.log('\n=== Recommendations ===');
    
    if (result.invalidRecords > 0) {
      console.log('⚠️  Some records have validation errors. Consider cleaning the data before import.');
    }
    
    const failedEnrichment = result.enrichmentStatus['failed_no_text_or_error_page'] || 0;
    if (failedEnrichment > 0) {
      console.log(`⚠️  ${failedEnrichment} records have failed enrichment and will be skipped during import.`);
    }
    
    const validForImport = result.validRecords - failedEnrichment;
    console.log(`✅ ${validForImport} records are ready for import.`);
  }
}

async function main() {
  const validator = new BusinessDataValidator();
  
  const filePath = path.join(process.cwd(), 'scripts', 'enriched_business_data_final.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  const result = validator.validateData(filePath);
  validator.printValidationReport(result);
  
  // Save detailed report
  const reportPath = path.join(process.cwd(), 'scripts', 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

if (require.main === module) {
  main();
}
