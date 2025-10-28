import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';

async function listExistingBusinesses() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userService = app.get(UserService);

  try {
    console.log('📋 Existing Business Accounts in Database:\n');
    
    // Get all users
    const allUsers = await userService.getAllUsers();
    
    // Filter users with business profile type
    const businessUsers = allUsers.filter(user => user.profileType === 'business');
    
    if (businessUsers.length === 0) {
      console.log('❌ No business accounts found in database.');
      console.log('Run the import script to create business accounts.');
    } else {
      console.log(`✅ Found ${businessUsers.length} business accounts:\n`);
      
      businessUsers.forEach((user, index) => {
        console.log(`${index + 1}. Business: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Website: ${user.social?.website || 'N/A'}`);
        console.log(`   Created: ${(user as any).createdAt || 'N/A'}`);
        console.log('   ---');
      });
      
      console.log('\n💡 Note: Passwords are hashed and not retrievable.');
      console.log('💡 Use the "Forgot Password" feature or create new accounts.');
    }

  } catch (error) {
    console.error('Error listing businesses:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  listExistingBusinesses();
}
