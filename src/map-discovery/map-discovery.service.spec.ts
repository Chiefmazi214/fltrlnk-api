import { Test, TestingModule } from '@nestjs/testing';
import { MapDiscoveryService } from './map-discovery.service';

describe('MapDiscoveryService', () => {
  let service: MapDiscoveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MapDiscoveryService],
    }).compile();

    service = module.get<MapDiscoveryService>(MapDiscoveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
