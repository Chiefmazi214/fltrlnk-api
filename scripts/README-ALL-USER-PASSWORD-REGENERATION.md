# All Users Password Regeneration

This document explains how to regenerate passwords for **ALL users** in the system, regardless of their role or profile type.

## Overview

The all-users password regeneration system allows you to update passwords for every user in the database to a standardized value: `fltr123.`

## Files

- `regenerate-all-user-passwords.ts` - Main script for all-users password regeneration
- `run-all-user-password-regeneration.sh` - Shell script to run the regeneration
- `all-user-password-update-results.json` - Results file with detailed update information

## Usage

### Option 1: Using the Shell Script (Recommended)

```bash
# Regenerate passwords for ALL users
./scripts/run-all-user-password-regeneration.sh

# Regenerate passwords for users of a specific profile type
./scripts/run-all-user-password-regeneration.sh type business
./scripts/run-all-user-password-regeneration.sh type individual
./scripts/run-all-user-password-regeneration.sh type personal
```

### Option 2: Direct JavaScript Execution

```bash
# First build the project
npm run build

# Regenerate passwords for ALL users
node dist/scripts/regenerate-all-user-passwords.js

# Regenerate passwords for specific profile type
node dist/scripts/regenerate-all-user-passwords.js type business
node dist/scripts/regenerate-all-user-passwords.js type individual
```

## Modes

### 1. All Users Mode (default)
- Finds **ALL users** in the system regardless of role or profile type
- Updates their passwords to `fltr123.`
- Processes users in batches of 10 to avoid system overload
- Provides detailed progress reporting and user type breakdown

### 2. Profile Type Mode
- Filters users by specific profile type (business, individual, personal, etc.)
- Updates passwords only for users matching the specified type
- Useful for targeted updates

## Output Files

The script generates the following output files:

### `all-user-password-update-results.json`
Contains detailed results for each password update attempt:
```json
[
  {
    "success": true,
    "userId": "user_id_here",
    "username": "user_username",
    "displayName": "User Display Name",
    "email": "user@example.com",
    "profileType": "business",
    "roles": ["BUSINESS"]
  },
  {
    "success": false,
    "userId": "user_id_here",
    "username": "user_username",
    "displayName": "User Display Name",
    "email": "user@example.com",
    "profileType": "individual",
    "roles": ["USER"],
    "error": "Error message"
  }
]
```

## Password Security

- All passwords are hashed using bcrypt with salt rounds of 10
- The plain text password `fltr123.` is used for all user accounts
- Passwords are stored securely in the database as hashed values

## Error Handling

The script handles various error scenarios:
- User not found
- Database connection issues
- Permission errors
- Invalid user data

Failed updates are logged with specific error messages for troubleshooting.

## Batch Processing

To avoid overwhelming the system:
- Users are processed in batches of 10
- 500ms delay between batches
- Progress is reported for each batch
- Final summary shows success/failure rates and user type breakdown

## User Type Summary

The script provides a breakdown of users by profile type:
- **Business users**: Users with business profiles
- **Individual users**: Users with individual profiles  
- **Personal users**: Users with personal profiles
- **Unknown users**: Users without a defined profile type

## Prerequisites

1. Ensure the application is properly configured
2. Database connection must be available
3. Required dependencies must be installed
4. Project must be built (`npm run build`)

## Example Output

```
=== All Users Password Regeneration Summary ===
Total users: 138
Successful updates: 138
Errors: 0
Success rate: 100.00%
New password: fltr123.

=== Summary by User Type ===
business: 102 users
personal: 24 users
unknown: 10 users
individual: 2 users
```

## Troubleshooting

### Common Issues

1. **"User not found" errors**
   - Check if the user actually exists in the database
   - Verify user ID format

2. **Database connection errors**
   - Ensure the database is running
   - Check connection configuration

3. **Build errors**
   - Run `npm run build` before executing the script
   - Check for TypeScript compilation errors

### Verification

After running the script, you can verify the password changes by:
1. Checking the `all-user-password-update-results.json` file
2. Attempting to login with the new password `fltr123.`
3. Reviewing the console output for success/failure counts and user type breakdown

## Security Considerations

- The standardized password `fltr123.` should be changed for production use
- Consider implementing password rotation policies
- Monitor for unauthorized access attempts
- Ensure proper access controls are in place
- All users will have the same password - consider security implications

## Performance

- Processes users in batches to prevent system overload
- Includes delays between batches for stability
- Provides real-time progress updates
- Handles large user databases efficiently

## Support

For issues or questions regarding all-users password regeneration:
1. Check the console output for error messages
2. Review the `all-user-password-update-results.json` file
3. Verify database connectivity and permissions
4. Ensure all prerequisites are met
5. Check the user type breakdown for unexpected results

## Comparison with Business-Only Script

| Feature | All Users Script | Business Only Script |
|---------|------------------|---------------------|
| Scope | All users | Business users only |
| User Types | All profile types | BUSINESS role only |
| Output File | `all-user-password-update-results.json` | `password-update-results.json` |
| User Breakdown | By profile type | Business users only |
| Use Case | System-wide reset | Business account management |

