import { Module } from '@nestjs/common';
import { MapDiscoveryService } from './map-discovery.service';
import { MapDiscoveryController } from './map-discovery.controller';
import { UserModule } from 'src/user/user.module';
import { BusinessModule } from 'src/business/business.module';
import { IndividualModule } from 'src/individual/individual.module';
import { ConnectionModule } from 'src/connection/connection.module';

@Module({
    imports: [
        UserModule,
        BusinessModule,
        // ADDED BY GORKEM => ConnectionModule
        IndividualModule,
        ConnectionModule
    ],
    providers: [MapDiscoveryService],
    controllers: [MapDiscoveryController]
})
export class MapDiscoveryModule {}
