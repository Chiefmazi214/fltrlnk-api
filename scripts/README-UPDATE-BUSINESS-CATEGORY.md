# Business Category Update Script

This script allows you to update business categories for existing users based on data from JSON files.

## Features

- **User Existence Check**: Checks if a user exists by email or phone number
- **Business Category Update**: Updates the business type for existing business profiles
- **Batch Processing**: Processes multiple business records from JSON files
- **Error Handling**: Comprehensive error handling and logging
- **Flexible File Processing**: Can process any JSON file with business data

## Usage

### Basic Usage
```bash
# Process HAIR___BEAUTY.json from category_8 folder
npm run script:update-category

# Process a specific file
npm run script:update-category HAIR___BEAUTY.json category_8

# Process a different category file
npm run script:update-category SERVICES.json category_7
```

### Command Line Arguments
- `filename`: The JSON file to process (default: HAIR___BEAUTY.json)
- `category-folder`: The folder containing the file (default: category_8)

## JSON File Format

The script expects JSON files with the following structure:

```json
[
  {
    "place_id": "unique_id",
    "Business Name": "Business Name",
    "Business Address": "Address",
    "Business Phone Number": "Phone Number",
    "Contact Email": "email@example.com",
    "Business Category": "HAIR & BEAUTY",
    "website": "https://example.com",
    // ... other fields
  }
]
```

## Business Category Mapping

The script maps the following categories to BusinessType enum values:

- `FOOD & BEVERAGE` → `food&beverage`
- `ACTIVITY` → `activity`
- `NIGHT LIFE` → `night life`
- `HAIR & BEAUTY` → `hair&beauty`
- `BODY & WELLNESS` → `body&wellness`
- `SERVICES` → `services`

## Process Flow

1. **Read JSON File**: Loads business data from the specified file
2. **User Lookup**: For each business record:
   - Extracts email and phone number
   - Searches for existing user by email or phone
3. **Business Update**: If user exists and has a business profile:
   - Maps the business category to the correct enum value
   - Updates the business type in the database
4. **Reporting**: Provides detailed results including:
   - Total records processed
   - Users found
   - Categories updated
   - Error details

## Example Output

```
Starting business category update process for: /path/to/HAIR___BEAUTY.json
Processing 100 business records from /path/to/HAIR___BEAUTY.json
Processing record 1/100: Antonette White
Successfully updated business category for user 507f1f77bcf86cd799439011 to hair&beauty
...

=== PROCESSING RESULTS ===
Total records: 100
Processed records: 85
Users found: 90
Categories updated: 85
Errors: 15

=== ERRORS ===
1. Record 5 (Business Name): User not found
2. Record 12 (Another Business): No business profile found for user
...
```

## Error Handling

The script handles various error scenarios:

- **User Not Found**: When no user exists with the provided email/phone
- **No Business Profile**: When user exists but doesn't have a business profile
- **Invalid Category**: When the business category cannot be mapped
- **Database Errors**: Connection or update failures
- **File Errors**: Missing or invalid JSON files

## Performance Considerations

- Processes records sequentially to avoid overwhelming the database
- Includes small delays every 10 records
- Comprehensive logging for monitoring progress
- Graceful error handling to continue processing even if individual records fail

## Dependencies

- NestJS Application Context
- UserService for user lookup
- BusinessService for business operations
- File system operations for JSON file reading
