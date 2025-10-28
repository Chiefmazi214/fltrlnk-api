import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RoleService } from '../src/user/role.service';
import { RoleEnum } from '../src/user/models/role.model';

async function setupRoles() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const roleService = app.get(RoleService);

  try {
    console.log('Setting up required roles...');

    // Create BUSINESS role if it doesn't exist
    let businessRole = await roleService.getRoleByName(RoleEnum.BUSINESS);
    if (!businessRole) {
      businessRole = await roleService.createRole({ name: RoleEnum.BUSINESS });
      console.log('✅ Created BUSINESS role');
    } else {
      console.log('✅ BUSINESS role already exists');
    }

    // Create INDIVIDUAL role if it doesn't exist
    let individualRole = await roleService.getRoleByName(RoleEnum.INDIVIDUAL);
    if (!individualRole) {
      individualRole = await roleService.createRole({ name: RoleEnum.INDIVIDUAL });
      console.log('✅ Created INDIVIDUAL role');
    } else {
      console.log('✅ INDIVIDUAL role already exists');
    }

    // Create ADMIN role if it doesn't exist
    let adminRole = await roleService.getRoleByName(RoleEnum.ADMIN);
    if (!adminRole) {
      adminRole = await roleService.createRole({ name: RoleEnum.ADMIN });
      console.log('✅ Created ADMIN role');
    } else {
      console.log('✅ ADMIN role already exists');
    }

    console.log('\nAll required roles are set up!');
    console.log('You can now run the business import script.');

  } catch (error) {
    console.error('Error setting up roles:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  setupRoles();
}
