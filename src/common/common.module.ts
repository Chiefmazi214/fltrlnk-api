import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseRepositoryBase } from './repository/mongoose/mongoose.repository';

@Global()
@Module({
  imports: [],
  providers: [MongooseRepositoryBase],
  exports: [MongooseRepositoryBase],
})
export class CommonModule {}
