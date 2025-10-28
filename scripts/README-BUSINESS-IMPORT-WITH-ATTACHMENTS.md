# Business Import with Attachments

This document explains the enhanced business import script that now includes automatic attachment creation functionality for media URLs.

## Overview

The updated `import-business-data.ts` script now processes `media_urls` from the business data and creates attachment records with type "document" in MongoDB, storing the original URLs directly.

## Features

### Core Functionality
- ✅ **User Creation**: Creates business user accounts with proper authentication
- ✅ **Business Records**: Creates business records with working hours and details
- ✅ **Location Handling**: Processes latitude/longitude coordinates
- ✅ **Password Management**: Uses standardized password `fltr123.` with bcrypt hashing
- ✅ **Media Attachments**: Creates attachment records for media URLs with type "document"

### Attachment Processing
- **URL Storage**: Stores original media URLs directly in the database
- **No Download**: Does not download files, only creates database records
- **Database**: Creates attachment records in MongoDB with type "document"
- **File Types**: Supports all file types based on URL extensions

## Data Structure

The script processes business data with the following structure:

```json
{
  "Business Name": "Business Name",
  "Contact Email": "email@example.com",
  "Business Phone Number": "+1234567890",
  "Business Address": "123 Main St, City, State",
  "Business Category": "FOOD & BEVERAGE",
  "website": "https://example.com",
  "media_urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.png",
    "https://example.com/logo.svg"
  ],
  "lat": 40.7128,
  "lng": -74.0060,
  "enrichment_status": "completed"
}
```

## Usage

### Option 1: Direct Execution

```bash
# Build the project
npm run build

# Run the import script
node dist/scripts/import-business-data.js
```

### Option 2: Test Attachment Upload

```bash
# Test attachment functionality
node dist/scripts/test-attachment-upload.js
```

## File Processing

### Media URL Processing
1. **URL Processing**: Each URL in `media_urls` is processed directly
2. **File Extension**: Extracted from URL pathname
3. **Filename**: Generated as `{business_name}_media_{index}.{extension}`
4. **Database**: Attachment record created with type "document" and original URL stored

### Supported File Types

| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| .jpg, .jpeg | image/jpeg | JPEG images |
| .png | image/png | PNG images |
| .gif | image/gif | GIF images |
| .webp | image/webp | WebP images |
| .svg | image/svg+xml | SVG vector images |
| .pdf | application/pdf | PDF documents |
| .doc | application/msword | Word documents |
| .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document | Word documents |
| .txt | text/plain | Text files |
| .mp4 | video/mp4 | MP4 videos |
| .avi | video/x-msvideo | AVI videos |
| .mov | video/quicktime | QuickTime videos |

## Database Schema

### Attachment Record
```typescript
{
  _id: ObjectId,
  filename: string,           // Generated filename
  path: string,              // Original media URL
  type: "document",          // Always "document" for media
  user: ObjectId,            // Reference to business user
  url: string,               // Original media URL
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

### URL Processing Errors
- **Invalid URLs**: Malformed URLs default to .jpg extension
- **Database Errors**: Attachment creation failures are logged and skipped

### Processing Flow
- **Individual Failures**: One failed attachment doesn't stop the entire business import
- **Batch Processing**: All media URLs for a business are processed in parallel
- **Success Tracking**: Logs successful vs failed attachment counts

## Configuration

### File Path
Update the file path in the main function:
```typescript
const filePath = path.join(
  process.cwd(),
  'scripts',
  'filtered_data.json'  // Change this to your data file
);
```

### Database Configuration
Ensure your MongoDB connection is properly configured in your application.

## Performance Considerations

### URL Processing
- **Fast Processing**: No file downloads means much faster processing
- **No Storage Costs**: No storage or bandwidth costs
- **Concurrent Processing**: All media URLs for a business are processed in parallel

## Example Output

```
Processing business 1/100: East Ave. Deli
Created user: 507f1f77bcf86cd799439011
Created business: 507f1f77bcf86cd799439012
Processing 8 media attachments for East Ave. Deli
Creating attachment for media URL: https://irp.cdn-website.com/903238dc/dms3rep/multi/Logo-header-wht.svg
Created attachment: 507f1f77bcf86cd799439013 for URL: https://irp.cdn-website.com/903238dc/dms3rep/multi/Logo-header-wht.svg
Creating attachment for media URL: https://irp.cdn-website.com/903238dc/dms3rep/multi/Logo-header.svg
Created attachment: 507f1f77bcf86cd799439014 for URL: https://irp.cdn-website.com/903238dc/dms3rep/multi/Logo-header.svg
...
Successfully created 8/8 attachment records
Business credentials - Username: east_ave_deli_0, Password: fltr123.
```

## Troubleshooting

### Common Issues

1. **Download Failures**
   - Check URL accessibility
   - Verify network connectivity
   - Check for rate limiting

2. **Upload Failures**
   - Verify Supabase configuration
   - Check storage permissions
   - Monitor storage quotas

3. **File Type Issues**
   - Unknown extensions default to .jpg
   - MIME type detection may be incorrect
   - Consider adding custom MIME type mapping

### Debug Mode
Add console.log statements to track:
- Download progress
- File sizes
- Upload status
- Error details

## Future Enhancements

- **Batch Size Control**: Limit concurrent downloads
- **Retry Logic**: Retry failed downloads
- **File Validation**: Validate file types before upload
- **Progress Tracking**: Show progress for large imports
- **Duplicate Detection**: Skip already processed URLs
- **Size Limits**: Add file size restrictions
