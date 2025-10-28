import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Individual, IndividualDocument } from "src/individual/models/individual.model";
import { IndividualRepositoryInterface } from "src/individual/repositories/abstract/individual.repository-interface";
import { PaginatedResultDto } from "src/common/pagination/paginated-result.dto";

export class IndividualRepository extends MongooseRepositoryBase<IndividualDocument> implements IndividualRepositoryInterface {
    constructor(@InjectModel(Individual.name) private individualModel: Model<IndividualDocument>) {
        super(individualModel);
    }

    async aggregate(pipeline: any[]): Promise<any[]> {
        return this.individualModel.aggregate(pipeline).exec();
    }

    async findNearby(latitude: number, longitude: number, maxDistance: number, page: number, limit: number): Promise<PaginatedResultDto<Individual>> {
        const skip = (page - 1) * limit;
        
        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $match: {
                    'user.location': {
                        $geoWithin: {
                            $centerSphere: [
                                [longitude, latitude],
                                maxDistance / 3963.2 // Convert miles to radians (Earth radius in miles)
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    biography: 1,
                    mapDiscovery: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'user._id': 1,
                    'user.username': 1,
                    'user.email': 1,
                    'user.profileImage': 1,
                    'user.attributes': 1,
                    'user.displayName': 1,
                    'user.location': 1,
                    'user.lifestyleInfo': 1,
                    'user.isOnline': 1
                }
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ];

        const [result] = await this.individualModel.aggregate(pipeline).exec();
        const total = result.metadata[0]?.total || 0;

        return { data: result.data, total, page, limit };
    }

    async findNearbyByName(latitude: number, longitude: number, maxDistance: number, name: string, page: number, limit: number): Promise<PaginatedResultDto<Individual>> {
        const skip = (page - 1) * limit;
        
        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $match: {
                    'user.location': {
                        $geoWithin: {
                            $centerSphere: [
                                [longitude, latitude],
                                maxDistance / 3963.2 // Convert miles to radians (Earth radius in miles)
                            ]
                        }
                    },
                    $or: [
                        { 'user.displayName': { $regex: name, $options: 'i' } },
                        { 'user.username': { $regex: name, $options: 'i' } }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    biography: 1,
                    mapDiscovery: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'user._id': 1,
                    'user.username': 1,
                    'user.email': 1,
                    'user.profileImage': 1,
                    'user.attributes': 1,
                    'user.displayName': 1,
                    'user.location': 1,
                    'user.lifestyleInfo': 1,
                    'user.isOnline': 1
                }
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ];

        const [result] = await this.individualModel.aggregate(pipeline).exec();
        const total = result.metadata[0]?.total || 0;

        return { data: result.data, total, page, limit };
    }

    async findByName(name: string, page: number, limit: number): Promise<PaginatedResultDto<Individual>> {
        const skip = (page - 1) * limit;
        const query = {
            $or: [
                { 'user.displayName': { $regex: name, $options: 'i' } },
                { 'user.username': { $regex: name, $options: 'i' } }
            ]
        };

        const [data, total] = await Promise.all([
            this.individualModel
                .find(query)
                .populate({
                    path: 'user',
                    select: 'username email profileImage attributes displayName location lifestyleInfo isOnline'
                })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.individualModel.countDocuments(query)
        ]);

        return { data, total, page, limit };
    }
}
