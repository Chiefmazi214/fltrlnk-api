import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Business, BusinessDocument } from "src/business/models/business.model";
import { BusinessRepositoryInterface } from "../abstract/business.repository-interface";

export class BusinessRepository extends MongooseRepositoryBase<BusinessDocument> implements BusinessRepositoryInterface {
    constructor(@InjectModel(Business.name) private businessModel: Model<BusinessDocument>) {
        super(businessModel);
    }

    async findNearby(latitude: number, longitude: number, maxDistance: number, businessType: string, page: number, limit: number): Promise<{ data: BusinessDocument[], total: number }> {
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
                    businessType
                }
            },
            {
                $addFields: {
                    'user.businessId': {
                        $cond: {
                            if: { $eq: ['$user.profileType', 'business'] },
                            then: '$_id',
                            else: null
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    companyName: 1,
                    businessType: 1,
                    description: 1,
                    address: 1,
                    phoneNumber: 1,
                    email: 1,
                    website: 1,
                    openingHours: 1,
                    services: 1,
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
                    'user.isOnline': 1,
                    'user.profileType': 1,
                    'user.businessId': 1
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

        const [result] = await this.businessModel.aggregate(pipeline).exec();
        const total = result.metadata[0]?.total || 0;

        return { data: result.data, total };
    }

    async findNearbyByName(latitude: number, longitude: number, maxDistance: number, name: string, page: number, limit: number): Promise<{ data: BusinessDocument[], total: number }> {
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
                        { companyName: { $regex: name, $options: 'i' } },
                        { 'user.displayName': { $regex: name, $options: 'i' } }
                    ]
                }
            },
            {
                $addFields: {
                    'user.businessId': {
                        $cond: {
                            if: { $eq: ['$user.profileType', 'business'] },
                            then: '$_id',
                            else: null
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    companyName: 1,
                    businessType: 1,
                    description: 1,
                    address: 1,
                    phoneNumber: 1,
                    email: 1,
                    website: 1,
                    openingHours: 1,
                    services: 1,
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
                    'user.isOnline': 1,
                    'user.profileType': 1,
                    'user.businessId': 1
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

        const [result] = await this.businessModel.aggregate(pipeline).exec();
        const total = result.metadata[0]?.total || 0;

        return { data: result.data, total };
    }

    async findByName(name: string, page: number, limit: number): Promise<{ data: BusinessDocument[], total: number }> {
        const skip = (page - 1) * limit;
        const query = {
            $or: [
                { companyName: { $regex: name, $options: 'i' } },
                { 'user.displayName': { $regex: name, $options: 'i' } }
            ]
        };

        const [data, total] = await Promise.all([
            this.businessModel
                .find(query)
                .populate({
                    path: 'user',
                    select: 'username email profileImage attributes displayName location lifestyleInfo isOnline profileType'
                })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.businessModel.countDocuments(query)
        ]);

        return { data, total };
    }
}
