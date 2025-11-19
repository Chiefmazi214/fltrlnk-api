import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum LifestyleInfoCategory {
    USERS = 'users',
    FOOD_AND_BEVERAGE = 'food&beverage',
    ACTIVITY = 'activity',
    NIGHT_LIFE = 'night life',
    HAIR_AND_BEAUTY = 'hair&beauty',
    BODY_AND_WELLNESS = 'body&wellness',
    SERVICES = 'services'
}

@Schema({_id: false})
export class CategorySetting {
    @Prop({ type: Boolean, required: true })
    individual: boolean;

    @Prop({ type: Boolean, required: true })
    foodAndBeverage: boolean;

    @Prop({ type: Boolean, required: true })
    entertainmentVenues: boolean;
    
    @Prop({ type: Boolean, required: true })
    outdoorActivity: boolean;

    @Prop({ type: Boolean, required: true })
    nightLife: boolean;
}

@Schema({_id: false})
export class DiscoverySetting {
    @Prop({ type: Boolean, required: true })
    fltrScreen: boolean;

    @Prop({ type: Boolean, required: true })
    stratosphereScreen: boolean;
}
    
@Schema({ timestamps: true, collection: 'user-settings' })
export class UserSetting {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    user: Types.ObjectId;

    @Prop({ type: [String], enum: LifestyleInfoCategory, required: false })
    lifestyleInfos: LifestyleInfoCategory[];

    @Prop({ type: CategorySetting, required: true })
    categorySetting: CategorySetting;

    @Prop({ type: DiscoverySetting, required: false })
    discovery: DiscoverySetting;

    @Prop({ type: Boolean, default: false })
    isNotificationEnabled: boolean;

    @Prop({ type: Boolean, default: false })
    isEmailNotificationEnabled: boolean;
}

export type UserSettingDocument = HydratedDocument<UserSetting>;
export const UserSettingSchema = SchemaFactory.createForClass(UserSetting);