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
  businessName: string;
  error?: string;
}

class BusinessPasswordRegenerator {
  private userService: UserService;
  private authService: AuthService;
  private roleService: RoleService;
  private businessRoleId: string;
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

  async initialize() {
    // Get business role
    const businessRole = await this.roleService.getRoleByName('BUSINESS');
    if (!businessRole) {
      throw new Error('Business role not found. Please create it first.');
    }
    this.businessRoleId = businessRole._id.toString();
    console.log(`Using business role ID: ${this.businessRoleId}`);
  }

  private async updateUserPassword(userId: string): Promise<PasswordUpdateResult> {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        return {
          success: false,
          userId,
          username: 'unknown',
          businessName: 'unknown',
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
        username: user.username,
        businessName: user.displayName || user.name || 'Unknown Business'
      };

    } catch (error) {
      return {
        success: false,
        userId,
        username: 'unknown',
        businessName: 'unknown',
        error: error.message
      };
    }
  }

  async regenerateAllBusinessPasswords() {
    console.log('Starting password regeneration for all business users...');
    
    try {
      await this.initialize();
      
      // Get all users with business role
      const allUsers = await this.userService.getAllUsers();
      const businessUsers = allUsers.filter(user => 
        user.roles && user.roles.some(role => (role as any)._id.toString() === this.businessRoleId)
      );

      console.log(`Found ${businessUsers.length} business users to update`);

      const results: PasswordUpdateResult[] = [];
      let successCount = 0;
      let errorCount = 0;

      // Process users in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < businessUsers.length; i += batchSize) {
        const batch = businessUsers.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(businessUsers.length / batchSize);
        
        console.log(`\n=== Processing Batch ${batchNumber}/${totalBatches} ===`);
        console.log(`Users ${i + 1} to ${i + batch.length} of ${businessUsers.length}`);
        
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
        if (i + batchSize < businessUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Save results to file
      const resultsPath = path.join(process.cwd(), 'scripts', 'password-update-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      console.log('\n=== Password Regeneration Summary ===');
      console.log(`Total business users: ${businessUsers.length}`);
      console.log(`Successful updates: ${successCount}`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Success rate: ${((successCount / businessUsers.length) * 100).toFixed(2)}%`);
      console.log(`New password: ${this.newPassword}`);
      console.log(`\nResults saved to: ${resultsPath}`);
      
      // Show some errors
      const errors = results.filter(r => !r.success).slice(0, 10);
      if (errors.length > 0) {
        console.log('\nFirst 10 errors:');
        errors.forEach(error => console.log(`- ${error.businessName} (${error.username}): ${error.error}`));
      }

      // Show some successful updates
      const successes = results.filter(r => r.success).slice(0, 10);
      if (successes.length > 0) {
        console.log('\nFirst 10 successful updates:');
        successes.forEach(success => console.log(`- ${success.businessName} (${success.username})`));
      }

    } catch (error) {
      console.error('Password regeneration failed:', error);
      throw error;
    }
  }

  async regeneratePasswordsFromCredentials() {
    console.log('Starting password regeneration from existing credentials file...');
    
    try {
      await this.initialize();
      
      // Read existing credentials file
      const credentialsPath = path.join(process.cwd(), 'scripts', 'business-credentials.json');
      if (!fs.existsSync(credentialsPath)) {
        throw new Error('business-credentials.json file not found. Please run the import first.');
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      console.log(`Found ${credentials.length} credentials to update`);

      const results: PasswordUpdateResult[] = [];
      let successCount = 0;
      let errorCount = 0;

      // Process credentials
      for (const credential of credentials) {
        try {
          // Find user by username
          const user = await this.userService.getUserByEmail(credential.username + '@business.local') || 
                      await this.userService.getUserByEmail(credential.businessName.toLowerCase().replace(/\s+/g, '_') + '@business.local');
          
          if (!user) {
            results.push({
              success: false,
              userId: 'unknown',
              username: credential.username,
              businessName: credential.businessName,
              error: 'User not found'
            });
            errorCount++;
            continue;
          }

          // Hash the new password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(this.newPassword, salt);
          
          // Update the user's password
          await this.userService.updateUser(user._id.toString(), { password: hashedPassword });

          results.push({
            success: true,
            userId: user._id.toString(),
            username: user.username,
            businessName: user.displayName || user.name || credential.businessName
          });
          successCount++;

        } catch (error) {
          results.push({
            success: false,
            userId: 'unknown',
            username: credential.username,
            businessName: credential.businessName,
            error: error.message
          });
          errorCount++;
        }
      }

      // Save results to file
      const resultsPath = path.join(process.cwd(), 'scripts', 'password-update-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      console.log('\n=== Password Regeneration Summary ===');
      console.log(`Total credentials: ${credentials.length}`);
      console.log(`Successful updates: ${successCount}`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Success rate: ${((successCount / credentials.length) * 100).toFixed(2)}%`);
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
  
  const regenerator = new BusinessPasswordRegenerator(
    userService, 
    authService, 
    roleService
  );
  
  try {
    // Check command line arguments
    const mode = process.argv[2] || 'all';
    
    if (mode === 'credentials') {
      await regenerator.regeneratePasswordsFromCredentials();
    } else {
      await regenerator.regenerateAllBusinessPasswords();
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
