import { Test, TestingModule } from '@nestjs/testing';
import { MapDiscoveryController } from './map-discovery.controller';

describe('MapDiscoveryController', () => {
  let controller: MapDiscoveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapDiscoveryController],
    }).compile();

    controller = module.get<MapDiscoveryController>(MapDiscoveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
