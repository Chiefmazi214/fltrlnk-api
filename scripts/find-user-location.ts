import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';

async function findUserLocation() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  
  try {
    // Find user by email
    const user = await userService.getUserByEmail('Qasim+11@gmail.com');
    
    if (!user) {
      console.log('User not found with email: Qasim+11@gmail.com');
      return;
    }
    
    console.log('=== User Found ===');
    console.log(`Name: ${user.name || user.displayName || 'No Name'}`);
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username || 'No Username'}`);
    console.log(`Profile Type: ${user.profileType || 'No Profile Type'}`);
    
    if (user.location) {
      console.log('\n=== Location Data ===');
      console.log(`Location Type: ${user.location.type}`);
      console.log(`Coordinates: [${user.location.coordinates[0]}, ${user.location.coordinates[1]}]`);
      console.log(`Longitude: ${user.location.coordinates[0]}`);
      console.log(`Latitude: ${user.location.coordinates[1]}`);
      
      // Convert to a more readable format
      const [longitude, latitude] = user.location.coordinates;
      console.log(`\n=== Location Details ===`);
      console.log(`Longitude: ${longitude}`);
      console.log(`Latitude: ${latitude}`);
      console.log(`Google Maps Link: https://www.google.com/maps?q=${latitude},${longitude}`);
    } else {
      console.log('\n=== No Location Data ===');
      console.log('This user does not have location information.');
    }
    
    // Also check if this user has a business record
    try {
      const business = await userService.getUserById(user._id.toString());
      if (business && (business as any).businessId) {
        console.log('\n=== Business Information ===');
        console.log(`Business ID: ${(business as any).businessId}`);
      }
    } catch (error) {
      // No business record
    }
    
  } catch (error) {
    console.error('Error finding user:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  findUserLocation();
}

