import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';

async function clearBusinessData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userService = app.get(UserService);

  try {
    console.log('⚠️  WARNING: This will show you existing business users.');
    console.log('The import script now handles duplicates automatically.');
    console.log('You can run the import directly without clearing data.\n');
    
    // Get all users
    const allUsers = await userService.getAllUsers();
    
    // Filter users with business profile type
    const businessUsers = allUsers.filter(user => user.profileType === 'business');
    
    console.log(`Found ${businessUsers.length} existing business users:`);
    businessUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });

    console.log('\n✅ The import script will automatically skip these duplicates.');
    console.log('Run: pnpm run import:businesses');

  } catch (error) {
    console.error('Error checking business data:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  clearBusinessData();
}
