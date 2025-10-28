import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseService } from './supabase/supabase.service';
import { StorageServiceInterface } from './abstract/storage-service.interface';

@Module({
  providers: [
    SupabaseService,
    {
      provide: StorageServiceInterface,
      useClass: SupabaseService,
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
