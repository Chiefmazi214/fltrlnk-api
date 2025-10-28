import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

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
    
@Schema({ timestamps: true, collection: 'user-settings' })
export class UserSetting {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    user: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], required: false, ref: 'LifestyleInfo' })
    lifestyleInfos: Types.ObjectId[];

    @Prop({ type: CategorySetting, required: true })
    categorySetting: CategorySetting;

    @Prop({ type: Boolean, default: false })
    isNotificationEnabled: boolean;

    @Prop({ type: Boolean, default: false })
    isEmailNotificationEnabled: boolean;
}

export type UserSettingDocument = HydratedDocument<UserSetting>;
export const UserSettingSchema = SchemaFactory.createForClass(UserSetting);