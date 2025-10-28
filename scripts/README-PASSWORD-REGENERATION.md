# Business User Password Regeneration

This document explains how to regenerate passwords for all business users in the system.

## Overview

The password regeneration system allows you to update all business user passwords to a standardized value: `fltr123.`

## Files

- `regenerate-business-passwords.ts` - Main script for password regeneration
- `run-password-regeneration.sh` - Shell script to run the regeneration
- `batch-import-businesses.ts` - Updated import script with proper password hashing

## Usage

### Option 1: Using the Shell Script (Recommended)

```bash
# Regenerate passwords for all business users
./scripts/run-password-regeneration.sh

# Or specify mode explicitly
./scripts/run-password-regeneration.sh all

# Regenerate passwords only for users in the credentials file
./scripts/run-password-regeneration.sh credentials
```

### Option 2: Direct JavaScript Execution

```bash
# First build the project
npm run build

# Regenerate passwords for all business users
node dist/scripts/regenerate-business-passwords.js

# Regenerate passwords from credentials file only
node dist/scripts/regenerate-business-passwords.js credentials
```

**Note**: Due to TypeScript module resolution issues, it's recommended to use the compiled JavaScript version rather than running TypeScript directly with `ts-node`.

## Modes

### 1. All Business Users Mode (default)
- Finds all users with the `BUSINESS` role
- Updates their passwords to `fltr123.`
- Processes users in batches of 10 to avoid system overload
- Provides detailed progress reporting

### 2. Credentials File Mode
- Reads from `scripts/business-credentials.json`
- Updates passwords only for users listed in the credentials file
- Useful for updating only recently imported businesses

## Output Files

The script generates the following output files:

### `password-update-results.json`
Contains detailed results for each password update attempt:
```json
[
  {
    "success": true,
    "userId": "user_id_here",
    "username": "business_username",
    "businessName": "Business Name"
  },
  {
    "success": false,
    "userId": "user_id_here",
    "username": "business_username", 
    "businessName": "Business Name",
    "error": "Error message"
  }
]
```

## Password Security

- All passwords are hashed using bcrypt with salt rounds of 10
- The plain text password `fltr123.` is used for all business accounts
- Passwords are stored securely in the database as hashed values

## Error Handling

The script handles various error scenarios:
- User not found
- Database connection issues
- Permission errors
- Duplicate user conflicts

Failed updates are logged with specific error messages for troubleshooting.

## Batch Processing

To avoid overwhelming the system:
- Users are processed in batches of 10
- 500ms delay between batches
- Progress is reported for each batch
- Final summary shows success/failure rates

## Prerequisites

1. Ensure the application is properly configured
2. Database connection must be available
3. Business role must exist in the system
4. Required dependencies must be installed

## Troubleshooting

### Common Issues

1. **"Business role not found"**
   - Run the setup-roles script first
   - Ensure the BUSINESS role exists in the database

2. **"User not found" errors**
   - Check if the user actually exists
   - Verify the user has the BUSINESS role

3. **Database connection errors**
   - Ensure the database is running
   - Check connection configuration

### Verification

After running the script, you can verify the password changes by:
1. Checking the `password-update-results.json` file
2. Attempting to login with the new password `fltr123.`
3. Reviewing the console output for success/failure counts

## Integration with Import Process

The updated `batch-import-businesses.ts` script now:
- Properly hashes passwords during user creation
- Uses bcrypt with salt rounds of 10
- Stores plain text passwords in credentials file for reference
- Maintains compatibility with existing import workflows

## Security Considerations

- The standardized password `fltr123.` should be changed for production use
- Consider implementing password rotation policies
- Monitor for unauthorized access attempts
- Ensure proper access controls are in place

## Support

For issues or questions regarding password regeneration:
1. Check the console output for error messages
2. Review the `password-update-results.json` file
3. Verify database connectivity and permissions
4. Ensure all prerequisites are met
