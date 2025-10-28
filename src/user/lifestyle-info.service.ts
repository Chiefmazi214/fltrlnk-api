import { Inject, Injectable } from '@nestjs/common';
import { LifestyleInfoRepositoryInterface } from './repositories/abstract/lifestyle-info.repository-interface';
import { LifestyleInfo, LifestyleInfoDocument, LifestyleCategory } from './models/lifestyle-info.model';

@Injectable()
export class LifestyleInfoService {
    constructor(
        @Inject(LifestyleInfoRepositoryInterface)
        private readonly lifestyleInfoRepository: LifestyleInfoRepositoryInterface
    ) {}

    async createLifestyleInfo(info: Partial<LifestyleInfo>): Promise<LifestyleInfoDocument> {
        return this.lifestyleInfoRepository.create(info);
    }

    async getLifestyleInfoByCategory(category: LifestyleCategory): Promise<LifestyleInfoDocument[]> {
        return this.lifestyleInfoRepository.findAll({ category, isActive: true });
    }

    async getAllLifestyleInfo(): Promise<LifestyleInfoDocument[]> {
        return this.lifestyleInfoRepository.findAll({ isActive: true });
    }

    async updateLifestyleInfo(id: string, info: Partial<LifestyleInfo>): Promise<LifestyleInfoDocument> {
        return this.lifestyleInfoRepository.update(id, info);
    }

    async deleteLifestyleInfo(id: string): Promise<LifestyleInfoDocument> {
        return this.lifestyleInfoRepository.update(id, { isActive: false });
    }

    async seedDefaultLifestyleInfo(): Promise<void> {
        const defaultInfo = [
            // Hobbies
            { name: 'Harry Potter', icon: '📚', category: LifestyleCategory.HOBBIES },
            { name: 'Basketball', icon: '🏀', category: LifestyleCategory.SPORTS },
            { name: 'Soccer', icon: '⚽', category: LifestyleCategory.SPORTS },
            { name: 'Gaming', icon: '🎮', category: LifestyleCategory.GAMES },
            { name: 'Music', icon: '🎵', category: LifestyleCategory.MUSIC },
            { name: 'Movies', icon: '🎬', category: LifestyleCategory.MOVIES },
            // Lifestyle
            { name: 'Travel', icon: '✈️', category: LifestyleCategory.LIFESTYLE },
            { name: 'Food', icon: '🍔', category: LifestyleCategory.LIFESTYLE },
            { name: 'Fashion', icon: '👗', category: LifestyleCategory.LIFESTYLE },
            { name: 'Fitness', icon: '💪', category: LifestyleCategory.LIFESTYLE },
            // Career
            { name: 'Developer', icon: '💻', category: LifestyleCategory.CAREER },
            { name: 'Designer', icon: '🎨', category: LifestyleCategory.CAREER },
            { name: 'CEO', icon: '👔', category: LifestyleCategory.CAREER }
        ];

        for (const info of defaultInfo) {
            const exists = await this.lifestyleInfoRepository.findOne({ 
                name: info.name, 
                category: info.category 
            });
            
            if (!exists) {
                await this.createLifestyleInfo(info);
            }
        }
    }

    async getLifestyleInfoById(id: string): Promise<LifestyleInfoDocument> {
        return this.lifestyleInfoRepository.findById(id);
    }
} 