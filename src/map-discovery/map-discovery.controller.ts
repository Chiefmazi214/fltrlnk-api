import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { MapDiscoveryService } from './map-discovery.service';
import { SearchDto } from './dtos/search.dto';
import { SearchBusinessDto } from './dtos/search-business.dto';
import { SearchBusinessByNameDto } from './dtos/search-business-by-name.dto';
import { SearchIndividualDto } from './dtos/search-individual.dto';
import { SearchIndividualByNameDto } from './dtos/search-individual-by-name.dto';
import { PaginatedResultDto } from 'src/common/pagination/paginated-result.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('map-discovery')
@ApiBearerAuth()
export class MapDiscoveryController {
    constructor(private readonly mapDiscoveryService: MapDiscoveryService) {}

    @Get('search')
    @UseGuards(AuthGuard)
    async search(@Query() searchDto: SearchDto, @Req() req: any): Promise<PaginatedResultDto<any>> {
        return this.mapDiscoveryService.search(searchDto, req.user?._id);
    }

    @Get('search-business')
    @UseGuards(AuthGuard)
    async searchBusiness(@Query() searchBusinessDto: SearchBusinessDto): Promise<PaginatedResultDto<any>> {
        return this.mapDiscoveryService.searchBusiness(searchBusinessDto);
    }

    @Get('search-business-by-name')
    @UseGuards(AuthGuard)
    async searchBusinessByName(@Query() searchBusinessByNameDto: SearchBusinessByNameDto): Promise<PaginatedResultDto<any>> {
        return this.mapDiscoveryService.searchBusinessByName(searchBusinessByNameDto);
    }

    @Get('search-individual')
    @UseGuards(AuthGuard)
    async searchIndividual(@Query() searchIndividualDto: SearchIndividualDto): Promise<PaginatedResultDto<any>> {
        return this.mapDiscoveryService.searchIndividual(searchIndividualDto);
    }

    @Get('search-individual-by-name')   
    @UseGuards(AuthGuard)
    async searchIndividualByName(@Query() searchIndividualByNameDto: SearchIndividualByNameDto): Promise<PaginatedResultDto<any>> {
        return this.mapDiscoveryService.searchIndividualByName(searchIndividualByNameDto);
    }
}
