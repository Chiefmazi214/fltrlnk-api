# Database Seeding Scripts

This directory contains scripts for seeding the database with initial data.

## Lifestyle Info Seeding Scripts

There are two versions of the lifestyle info seeding script:

### 1. Hardcoded Data Version (`seed-lifestyle-info.ts`)

The `seed-lifestyle-info.ts` script populates the lifestyle information collection with hardcoded data from the NicheData.json file (embedded in the script).

### 2. File-based Version (`seed-lifestyle-info-from-file.ts`)

The `seed-lifestyle-info-from-file.ts` script reads the NicheData.json file from the filesystem and populates the lifestyle information collection.

### Features

- **Category Mapping**: Maps NicheData categories to the LifestyleCategory enum
- **Duplicate Prevention**: Skips existing entries to avoid duplicates
- **Random Icons**: Assigns appropriate icons to each category
- **Progress Tracking**: Shows real-time progress and summary statistics
- **Error Handling**: Gracefully handles errors and continues processing

### Category Mappings

| NicheData Category | LifestyleCategory |
|-------------------|-------------------|
| Sports | sports |
| Activity | hobbies |
| Outdoors | outdoors |
| Entertainment | entertainment |
| Music | music |
| Art | art |
| STEM | stem |
| Business | career |
| Food | food |
| Outing | outing |
| Leisure | leisure |
| Night Life | night_life |
| Lifestyle | lifestyle |

### Usage

```bash
# Run the hardcoded data version
npm run seed:lifestyle

# Run the file-based version (requires NicheData.json file)
npm run seed:lifestyle:file

# Or using pnpm
pnpm seed:lifestyle
pnpm seed:lifestyle:file

# Or using yarn
yarn seed:lifestyle
yarn seed:lifestyle:file
```

### Output Example

```
🚀 Starting lifestyle info seeding...
📝 Processing category: Sports -> sports
✅ Created: Basketball (sports)
✅ Created: Football (sports)
⏭️  Skipping "Soccer" - already exists
...

🎉 Seeding completed!
📊 Summary:
   ✅ Total inserted: 847
   ⏭️  Total skipped: 12
   📈 Total processed: 859
✨ Script completed successfully
```

### Requirements

- MongoDB connection must be configured
- Environment variables must be set up
- NestJS application must be able to start
- For file-based version: NicheData.json file must exist in one of these locations:
  - `./NicheData.json`
  - `./data/NicheData.json`
  - `./src/data/NicheData.json`

### Notes

- The script uses `NestFactory.createApplicationContext()` to avoid starting the full HTTP server
- Icons are randomly assigned from a predefined set for each category
- The script checks for existing entries by name and category to prevent duplicates
- All entries are created with `isActive: true` 