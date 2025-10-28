import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AttachmentService } from '../src/attachment/attachment.service';
import { AttachmentType } from '../src/attachment/models/attachment.model';

async function testAttachmentCreation() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const attachmentService = app.get(AttachmentService);
  
  try {
    // Test URL from your data
    const testUrl = 'https://irp.cdn-website.com/903238dc/dms3rep/multi/Logo-header-wht.svg';
    
    console.log('Testing attachment creation...');
    console.log(`URL: ${testUrl}`);
    
    // Get file extension
    const extension = getFileExtension(testUrl);
    console.log(`File extension: ${extension}`);
    
    // Create filename
    const filename = `test_business_media_0${extension}`;
    console.log(`Filename: ${filename}`);
    
    // Create attachment record directly with URL
    const attachment = await attachmentService.createAttachment({
      filename: filename,
      path: testUrl, // Store the original URL as the path
      type: AttachmentType.DOCUMENT,
      user: null, // No user for test
      url: testUrl // Store the original URL as the public URL
    });
    
    console.log(`✅ Successfully created attachment: ${attachment._id}`);
    console.log(`Attachment type: ${attachment.type}`);
    console.log(`Attachment URL: ${attachment.url}`);
    console.log(`Attachment path: ${attachment.path}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await app.close();
  }
}

function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Extract extension manually
    const lastDotIndex = pathname.lastIndexOf('.');
    if (lastDotIndex !== -1 && lastDotIndex < pathname.length - 1) {
      return pathname.substring(lastDotIndex);
    }
    return '.jpg';
  } catch {
    return '.jpg';
  }
}

if (require.main === module) {
  testAttachmentCreation();
}
