import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import * as fs from 'fs';
import * as path from 'path';

interface LocationUpdateResult {
  success: boolean;
  userId: string;
  username: string;
  email: string;
  oldLocation?: {
    longitude: number;
    latitude: number;
  };
  newLocation: {
    longitude: number;
    latitude: number;
  };
  error?: string;
}

class LocationCopier {
  private userService: UserService;
  private sourceLocation: {
    longitude: number;
    latitude: number;
  };
  private radiusKm: number = 5; // 5km radius for nearby locations
  private batchSize: number = 10;

  constructor(userService: UserService) {
    this.userService = userService;
    // Source location from Qasim+11@gmail.com
    this.sourceLocation = {
      longitude: 29.9408089,
      latitude: 40.7654408
    };
  }

  // Generate a random nearby location within the specified radius
  private generateNearbyLocation(): { longitude: number; latitude: number } {
    // Convert radius from km to degrees (approximate)
    const radiusInDegrees = this.radiusKm / 111; // 1 degree ≈ 111 km
    
    // Generate random offset within the radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusInDegrees;
    
    const offsetLat = distance * Math.cos(angle);
    const offsetLng = distance * Math.sin(angle);
    
    return {
      longitude: this.sourceLocation.longitude + offsetLng,
      latitude: this.sourceLocation.latitude + offsetLat
    };
  }

  // Calculate distance between two points in km
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  private async updateUserLocation(userId: string): Promise<LocationUpdateResult> {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        return {
          success: false,
          userId,
          username: 'unknown',
          email: 'unknown',
          newLocation: { longitude: 0, latitude: 0 },
          error: 'User not found'
        };
      }

      // Skip if this is the source user
      if (user.email === 'Qasim+11@gmail.com') {
        return {
          success: false,
          userId,
          username: user.username || 'unknown',
          email: user.email || 'unknown',
          newLocation: { longitude: 0, latitude: 0 },
          error: 'Source user - skipped'
        };
      }

      const oldLocation = user.location ? {
        longitude: user.location.coordinates[0],
        latitude: user.location.coordinates[1]
      } : undefined;

      // Generate new nearby location
      const newLocation = this.generateNearbyLocation();
      
      // Update user location
      await this.userService.updateUser(userId, {
        location: {
          type: 'Point',
          coordinates: [newLocation.longitude, newLocation.latitude]
        }
      });

      return {
        success: true,
        userId,
        username: user.username || 'no-username',
        email: user.email || 'no-email',
        oldLocation,
        newLocation
      };

    } catch (error) {
      return {
        success: false,
        userId,
        username: 'unknown',
        email: 'unknown',
        newLocation: { longitude: 0, latitude: 0 },
        error: error.message
      };
    }
  }

  async copyLocationToAllUsers() {
    console.log('Starting location copying for all users...');
    console.log(`Source location: ${this.sourceLocation.latitude}, ${this.sourceLocation.longitude}`);
    console.log(`Radius for nearby locations: ${this.radiusKm} km`);
    
    try {
      // Get all users
      const allUsers = await this.userService.getAllUsers();
      console.log(`Found ${allUsers.length} total users`);

      const results: LocationUpdateResult[] = [];
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;

      // Process users in batches
      for (let i = 0; i < allUsers.length; i += this.batchSize) {
        const batch = allUsers.slice(i, i + this.batchSize);
        const batchNumber = Math.floor(i / this.batchSize) + 1;
        const totalBatches = Math.ceil(allUsers.length / this.batchSize);
        
        console.log(`\n=== Processing Batch ${batchNumber}/${totalBatches} ===`);
        console.log(`Users ${i + 1} to ${i + batch.length} of ${allUsers.length}`);
        
        // Process batch
        const batchPromises = batch.map(user => 
          this.updateUserLocation(user._id.toString())
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Count results
        const batchSuccess = batchResults.filter(r => r.success).length;
        const batchErrors = batchResults.filter(r => !r.success && !r.error?.includes('skipped')).length;
        const batchSkipped = batchResults.filter(r => r.error?.includes('skipped')).length;
        
        successCount += batchSuccess;
        errorCount += batchErrors;
        skippedCount += batchSkipped;
        
        console.log(`Batch ${batchNumber} completed: ${batchSuccess} success, ${batchErrors} errors, ${batchSkipped} skipped`);
        
        // Small delay between batches
        if (i + this.batchSize < allUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Save results to file
      const resultsPath = path.join(process.cwd(), 'scripts', 'location-copy-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      console.log('\n=== Location Copy Summary ===');
      console.log(`Total users: ${allUsers.length}`);
      console.log(`Successful updates: ${successCount}`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Skipped (source user): ${skippedCount}`);
      console.log(`Success rate: ${((successCount / (allUsers.length - 1)) * 100).toFixed(2)}%`);
      console.log(`\nResults saved to: ${resultsPath}`);
      
      // Show some successful updates
      const successes = results.filter(r => r.success).slice(0, 10);
      if (successes.length > 0) {
        console.log('\nFirst 10 successful location updates:');
        successes.forEach(success => {
          const distance = success.oldLocation ? 
            this.calculateDistance(
              success.oldLocation.latitude, 
              success.oldLocation.longitude,
              success.newLocation.latitude, 
              success.newLocation.longitude
            ).toFixed(2) : 'N/A';
          console.log(`- ${success.username} (${success.email}): ${success.newLocation.latitude}, ${success.newLocation.longitude} (moved ${distance}km)`);
        });
      }

      // Show some errors
      const errors = results.filter(r => !r.success && !r.error?.includes('skipped')).slice(0, 5);
      if (errors.length > 0) {
        console.log('\nFirst 5 errors:');
        errors.forEach(error => console.log(`- ${error.username} (${error.email}): ${error.error}`));
      }

      // Show location statistics
      const successfulUpdates = results.filter(r => r.success);
      if (successfulUpdates.length > 0) {
        const distances = successfulUpdates.map(r => 
          this.calculateDistance(
            this.sourceLocation.latitude,
            this.sourceLocation.longitude,
            r.newLocation.latitude,
            r.newLocation.longitude
          )
        );
        
        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const maxDistance = Math.max(...distances);
        const minDistance = Math.min(...distances);
        
        console.log('\n=== Location Statistics ===');
        console.log(`Average distance from source: ${avgDistance.toFixed(2)} km`);
        console.log(`Maximum distance from source: ${maxDistance.toFixed(2)} km`);
        console.log(`Minimum distance from source: ${minDistance.toFixed(2)} km`);
      }

    } catch (error) {
      console.error('Location copying failed:', error);
      throw error;
    }
  }

  async copyLocationToSpecificUsers(userEmails: string[]) {
    console.log('Starting location copying for specific users...');
    console.log(`Source location: ${this.sourceLocation.latitude}, ${this.sourceLocation.longitude}`);
    console.log(`Target users: ${userEmails.length}`);
    
    try {
      const results: LocationUpdateResult[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const email of userEmails) {
        try {
          const user = await this.userService.getUserByEmail(email);
          if (!user) {
            results.push({
              success: false,
              userId: 'unknown',
              username: 'unknown',
              email,
              newLocation: { longitude: 0, latitude: 0 },
              error: 'User not found'
            });
            errorCount++;
            continue;
          }

          const result = await this.updateUserLocation(user._id.toString());
          results.push(result);
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }

        } catch (error) {
          results.push({
            success: false,
            userId: 'unknown',
            username: 'unknown',
            email,
            newLocation: { longitude: 0, latitude: 0 },
            error: error.message
          });
          errorCount++;
        }
      }

      // Save results to file
      const resultsPath = path.join(process.cwd(), 'scripts', 'location-copy-specific-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      console.log('\n=== Specific Users Location Copy Summary ===');
      console.log(`Target users: ${userEmails.length}`);
      console.log(`Successful updates: ${successCount}`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Success rate: ${((successCount / userEmails.length) * 100).toFixed(2)}%`);
      console.log(`\nResults saved to: ${resultsPath}`);

    } catch (error) {
      console.error('Location copying failed:', error);
      throw error;
    }
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  
  const copier = new LocationCopier(userService);
  
  try {
    // Check command line arguments
    const mode = process.argv[2] || 'all';
    
    if (mode === 'specific') {
      // For specific users, you can modify this array
      const specificEmails = [
        'user1@example.com',
        'user2@example.com'
      ];
      await copier.copyLocationToSpecificUsers(specificEmails);
    } else {
      await copier.copyLocationToAllUsers();
    }
    
  } catch (error) {
    console.error('Location copying failed:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  main();
}

