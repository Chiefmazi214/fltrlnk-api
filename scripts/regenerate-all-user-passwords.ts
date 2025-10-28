import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { AuthService } from '../src/auth/auth.service';
import { RoleService } from '../src/user/role.service';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

interface PasswordUpdateResult {
  success: boolean;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  profileType: string;
  roles: string[];
  error?: string;
}

class AllUserPasswordRegenerator {
  private userService: UserService;
  private authService: AuthService;
  private roleService: RoleService;
  private newPassword: string = 'fltr123.';

  constructor(
    userService: UserService,
    authService: AuthService,
    roleService: RoleService
  ) {
    this.userService = userService;
    this.authService = authService;
    this.roleService = roleService;
  }

  private async updateUserPassword(userId: string): Promise<PasswordUpdateResult> {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        return {
          success: false,
          userId,
          username: 'unknown',
          displayName: 'unknown',
          email: 'unknown',
          profileType: 'unknown',
          roles: [],
          error: 'User not found'
        };
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.newPassword, salt);
      
      // Update the user's password
      await this.userService.updateUser(userId, { password: hashedPassword });

      return {
        success: true,
        userId,
        username: user.username || 'no-username',
        displayName: user.displayName || user.name || 'No Name',
        email: user.email || 'no-email',
        profileType: user.profileType || 'unknown',
        roles: user.roles ? user.roles.map(role => (role as any).name || 'unknown') : []
      };

    } catch (error) {
      return {
        success: false,
        userId,
        username: 'unknown',
        displayName: 'unknown',
        email: 'unknown',
        profileType: 'unknown',
        roles: [],
        error: error.message
      };
    }
  }

  async regenerateAllUserPasswords() {
    console.log('Starting password regeneration for ALL users...');
    
    try {
      // Get all users in the system
      const allUsers = await this.userService.getAllUsers();
      console.log(`Found ${allUsers.length} total users to update`);

      const results: PasswordUpdateResult[] = [];
      let successCount = 0;
      let errorCount = 0;

      // Process users in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < allUsers.length; i += batchSize) {
        const batch = allUsers.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(allUsers.length / batchSize);
        
        console.log(`\n=== Processing Batch ${batchNumber}/${totalBatches} ===`);
        console.log(`Users ${i + 1} to ${i + batch.length} of ${allUsers.length}`);
        
        // Process batch
        const batchPromises = batch.map(user => 
          this.updateUserPassword(user._id.toString())
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Count results
        const batchSuccess = batchResults.filter(r => r.success).length;
        const batchErrors = batchResults.filter(r => !r.success).length;
        
        successCount += batchSuccess;
        errorCount += batchErrors;
        
        console.log(`Batch ${batchNumber} completed: ${batchSuccess} success, ${batchErrors} errors`);
        
        // Small delay between batches
        if (i + batchSize < allUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Save results to file
      const resultsPath = path.join(process.cwd(), 'scripts', 'all-user-password-update-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      // Generate summary by user type
      const summaryByType = this.generateSummaryByType(results);

      console.log('\n=== All Users Password Regeneration Summary ===');
      console.log(`Total users: ${allUsers.length}`);
      console.log(`Successful updates: ${successCount}`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Success rate: ${((successCount / allUsers.length) * 100).toFixed(2)}%`);
      console.log(`New password: ${this.newPassword}`);
      console.log(`\nResults saved to: ${resultsPath}`);
      
      // Show summary by user type
      console.log('\n=== Summary by User Type ===');
      Object.entries(summaryByType).forEach(([type, count]) => {
        console.log(`${type}: ${count} users`);
      });
      
      // Show some errors
      const errors = results.filter(r => !r.success).slice(0, 10);
      if (errors.length > 0) {
        console.log('\nFirst 10 errors:');
        errors.forEach(error => console.log(`- ${error.displayName} (${error.email}): ${error.error}`));
      }

      // Show some successful updates by type
      const successes = results.filter(r => r.success);
      const businessUsers = successes.filter(r => r.profileType === 'business').slice(0, 5);
      const individualUsers = successes.filter(r => r.profileType === 'individual').slice(0, 5);
      const otherUsers = successes.filter(r => !['business', 'individual'].includes(r.profileType)).slice(0, 5);

      if (businessUsers.length > 0) {
        console.log('\nSample business users updated:');
        businessUsers.forEach(user => console.log(`- ${user.displayName} (${user.email})`));
      }

      if (individualUsers.length > 0) {
        console.log('\nSample individual users updated:');
        individualUsers.forEach(user => console.log(`- ${user.displayName} (${user.email})`));
      }

      if (otherUsers.length > 0) {
        console.log('\nSample other users updated:');
        otherUsers.forEach(user => console.log(`- ${user.displayName} (${user.email}) - Type: ${user.profileType}`));
      }

    } catch (error) {
      console.error('Password regeneration failed:', error);
      throw error;
    }
  }

  private generateSummaryByType(results: PasswordUpdateResult[]): Record<string, number> {
    const summary: Record<string, number> = {};
    
    results.forEach(result => {
      if (result.success) {
        const type = result.profileType || 'unknown';
        summary[type] = (summary[type] || 0) + 1;
      }
    });
    
    return summary;
  }

  async regeneratePasswordsByType(profileType: string) {
    console.log(`Starting password regeneration for ${profileType} users only...`);
    
    try {
      // Get all users in the system
      const allUsers = await this.userService.getAllUsers();
      const filteredUsers = allUsers.filter(user => user.profileType === profileType);
      
      console.log(`Found ${filteredUsers.length} ${profileType} users to update`);

      if (filteredUsers.length === 0) {
        console.log(`No ${profileType} users found.`);
        return;
      }

      const results: PasswordUpdateResult[] = [];
      let successCount = 0;
      let errorCount = 0;

      // Process users in batches
      const batchSize = 10;
      for (let i = 0; i < filteredUsers.length; i += batchSize) {
        const batch = filteredUsers.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(filteredUsers.length / batchSize);
        
        console.log(`\n=== Processing Batch ${batchNumber}/${totalBatches} ===`);
        console.log(`Users ${i + 1} to ${i + batch.length} of ${filteredUsers.length}`);
        
        // Process batch
        const batchPromises = batch.map(user => 
          this.updateUserPassword(user._id.toString())
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Count results
        const batchSuccess = batchResults.filter(r => r.success).length;
        const batchErrors = batchResults.filter(r => !r.success).length;
        
        successCount += batchSuccess;
        errorCount += batchErrors;
        
        console.log(`Batch ${batchNumber} completed: ${batchSuccess} success, ${batchErrors} errors`);
        
        // Small delay between batches
        if (i + batchSize < filteredUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Save results to file
      const resultsPath = path.join(process.cwd(), 'scripts', `${profileType}-user-password-update-results.json`);
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      console.log(`\n=== ${profileType.toUpperCase()} Users Password Regeneration Summary ===`);
      console.log(`Total ${profileType} users: ${filteredUsers.length}`);
      console.log(`Successful updates: ${successCount}`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Success rate: ${((successCount / filteredUsers.length) * 100).toFixed(2)}%`);
      console.log(`New password: ${this.newPassword}`);
      console.log(`\nResults saved to: ${resultsPath}`);

    } catch (error) {
      console.error('Password regeneration failed:', error);
      throw error;
    }
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userService = app.get(UserService);
  const authService = app.get(AuthService);
  const roleService = app.get(RoleService);
  
  const regenerator = new AllUserPasswordRegenerator(
    userService, 
    authService, 
    roleService
  );
  
  try {
    // Check command line arguments
    const mode = process.argv[2] || 'all';
    const profileType = process.argv[3];
    
    if (mode === 'type' && profileType) {
      await regenerator.regeneratePasswordsByType(profileType);
    } else {
      await regenerator.regenerateAllUserPasswords();
    }
    
  } catch (error) {
    console.error('Password regeneration failed:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  main();
}
