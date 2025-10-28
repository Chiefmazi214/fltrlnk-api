 # Business Data Import Guide

This guide explains how to import the enriched business data from `enriched_business_data_final.json` into your FTRL backend database.

## Overview

The import process will:
1. Create user accounts for each business
2. Create business records linked to those users
3. Handle geocoding for location data
4. Process data in batches to avoid overwhelming the database
5. Generate credentials for each business account

## Prerequisites

1. **Database Setup**: Ensure MongoDB is running and accessible
2. **Environment Variables**: Set up your `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/ftrl
   JWT_SECRET=your-jwt-secret
   OPENCAGE_API_KEY=your-opencage-api-key  # Optional, for geocoding
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key  # Optional, alternative geocoding
   ```
3. **Data File**: Ensure `enriched_business_data_final.json` is in the `../Documents/` directory (relative to your project root)

## Step-by-Step Import Process

### Step 1: Validate Data
First, validate your business data to understand what will be imported:

```bash
pnpm run validate:business-data
```

This will:
- Check data quality and completeness
- Show statistics about categories and enrichment status
- Identify records that will be skipped
- Generate a detailed validation report

### Step 2: Setup Required Roles
Ensure the required user roles exist in your database:

```bash
pnpm run setup:roles
```

This creates the following roles if they don't exist:
- `BUSINESS` - For business accounts
- `INDIVIDUAL` - For individual users
- `ADMIN` - For admin users

### Step 3: Import Business Data

#### Full Import (All 3,111 records)
```bash
pnpm run import:businesses
```

#### Partial Import (for testing or resuming)
```bash
# Import records 0-100
pnpm run import:businesses:partial 0 100

# Import records 100-200
pnpm run import:businesses:partial 100 200
```

## Import Configuration

The import process uses the following settings:
- **Batch Size**: 50 records per batch
- **Delay Between Batches**: 2 seconds
- **Geocoding**: Optional (requires API key)
- **Error Handling**: Continues processing even if individual records fail

## Data Mapping

### Source Data → Database Schema

| Source Field | Target Field | Notes |
|--------------|--------------|-------|
| Business Name | user.name, business.companyName | Primary identifier |
| Contact Email | user.email | Used for login |
| Business Phone Number | user.phone, business.phone | Contact information |
| Business Address | user.location.coordinates | Geocoded to lat/lng |
| Business Category | business.businessType | Mapped to enum values |
| Business Niche | business.miniProfileBio | Short description |
| Business Characteristics | business.radarProfileBio | Detailed description |
| website | user.social.website, business.website | Website URL |
| facebook_url | user.social.facebook | Social media link |
| instagram_url | user.social.instagram | Social media link |
| Other social URLs | user.social.* | Social media links |

### Business Type Mapping

| Source Category | Database Enum |
|----------------|---------------|
| FOOD & BEVERAGE | `food&beverage` |
| ACTIVITY | `activity` |
| NIGHT LIFE | `night life` |
| HAIR & BEAUTY | `hair&beauty` |
| BODY & WELLNESS | `body&wellness` |

## Generated Credentials

Each business account will have:
- **Username**: Generated from business name (e.g., `east_ave_deli_0`)
- **Password**: `fltr123.` (consistent for all business accounts)
- **Email**: From source data or generated (e.g., `username@business.local`)

Credentials are saved to `scripts/business-credentials.json` for reference.

## Output Files

After import, you'll find these files in the `scripts/` directory:

1. **`import-results.json`** - Detailed results for each record
2. **`business-credentials.json`** - Login credentials for all businesses
3. **`validation-report.json`** - Data validation report

## Error Handling

The import process handles various error scenarios:
- **Duplicate emails**: Skips records with existing emails
- **Invalid data**: Logs errors and continues processing
- **Geocoding failures**: Continues without location data
- **Database errors**: Logs and continues with next record

## Monitoring Progress

The import process provides detailed logging:
- Progress indicators for each batch
- Success/error counts
- Individual record status
- Final summary statistics

## Post-Import Steps

1. **Verify Data**: Check the database for imported records
2. **Test Login**: Use generated credentials to test business accounts
3. **Review Errors**: Check `import-results.json` for any failed imports
4. **Clean Up**: Remove temporary files if needed

## Troubleshooting

### Common Issues

1. **"Business role not found"**
   - Run `pnpm run setup:roles` first

2. **"File not found"**
   - Ensure `enriched_business_data_final.json` is in the `../Documents/` directory (relative to project root)

3. **Database connection errors**
   - Check your `MONGO_URI` in `.env`
   - Ensure MongoDB is running

4. **Geocoding failures**
   - Add `OPENCAGE_API_KEY` or `GOOGLE_MAPS_API_KEY` to `.env`
   - Or run without geocoding (records will have no location data)

5. **Memory issues with large imports**
   - Use partial imports: `pnpm run import:businesses:partial 0 1000`
   - Increase batch delay in the script if needed

### Performance Tips

- **Large datasets**: Use partial imports to avoid memory issues
- **Rate limiting**: Increase delay between batches if hitting API limits
- **Geocoding**: Consider running without geocoding first, then add locations later

## Data Quality Notes

- Records with `enrichment_status: "failed_no_text_or_error_page"` are automatically skipped
- Invalid email formats are logged but don't stop the import
- Missing required fields are handled gracefully
- Social media URLs are validated before saving

## Security Considerations

- Generated passwords are random and secure
- Business accounts are created with `emailVerified: true` for immediate use
- All credentials are logged for administrative access
- Consider changing default passwords after import

## Next Steps

After successful import:
1. Test the map discovery feature with imported businesses
2. Verify business profiles display correctly
3. Test the search functionality
4. Consider setting up business-specific features
5. Plan for ongoing data maintenance and updates
