import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import * as bcrypt from 'bcryptjs';

async function updateBusinessPasswords() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  try {
    console.log('🔄 Updating passwords for all business users...');
    
    // Get all users with profileType 'business'
    const businessUsers = await userService.getAllUsers();
    const businessUsersFiltered = businessUsers.filter(user => user.profileType === 'business');
    
    console.log(`📊 Found ${businessUsersFiltered.length} business users`);
    
    const newPassword = 'fltr123.';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const user of businessUsersFiltered) {
      try {
        // Update the user's password
        await userService.updateUser(user._id.toString(), {
          password: hashedPassword
        });
        
        console.log(`✅ Updated password for: ${user.name} (${user.email})`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to update password for: ${user.name} (${user.email})`, error);
        errorCount++;
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} users`);
    console.log(`❌ Failed to update: ${errorCount} users`);
    console.log(`🔑 New password for all business users: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error updating business passwords:', error);
  } finally {
    await app.close();
  }
}

updateBusinessPasswords().catch(console.error);
