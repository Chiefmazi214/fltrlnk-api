import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Role } from './role.model';
import { LifestyleInfo, LifestyleInfoDocument } from './lifestyle-info.model';
import { UserStatus } from '../user.enum';

@Schema({ _id: false })
export class UserLocation {
  @Prop({ type: String, enum: ['Point'], required: true })
  type: string;

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: function (v: number[]) {
        return (
          v.length === 2 &&
          v[0] >= -180 &&
          v[0] <= 180 &&
          v[1] >= -90 &&
          v[1] <= 90
        );
      },
      message: 'Coordinates must be [longitude, latitude] with valid ranges',
    },
  })
  coordinates: number[];
}

@Schema({ _id: false })
export class SocialLinks {
  @Prop({ required: false })
  website: string;

  @Prop({ required: false })
  instagram: string;

  @Prop({ required: false })
  tiktok: string;

  @Prop({ required: false })
  youtube: string;

  @Prop({ required: false })
  linkedin: string;

  @Prop({ required: false })
  facebook: string;

  @Prop({ required: false })
  external1: string;

  @Prop({ required: false })
  external2: string;

  @Prop({ required: false })
  external3: string;
}

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: false })
  name: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ required: false, unique: true, sparse: true })
  email: string;

  @Prop({ required: false, unique: true, sparse: true })
  phone: string;

  @Prop({ required: false, unique: true, sparse: true })
  googleProviderId: string;

  @Prop({ required: false, unique: true, sparse: true })
  facebookProviderId: string;

  @Prop({ required: false, default: false })
  emailVerified: boolean;

  @Prop({ required: false, default: false })
  phoneVerified: boolean;

  @Prop({ required: false, default: false })
  isVerified: boolean; // when it have some boosts

  @Prop({ required: false })
  password: string;

  @Prop({ type: [mongoose.Types.ObjectId], required: true, ref: 'Role' })
  roles: Role[];

  @Prop({ required: false })
  displayName: string;

  @Prop({ required: false })
  username: string;

  @Prop({ required: false })
  dateOfBirth: Date;

  @Prop({ required: false })
  profileType: string;

  @Prop({ required: false, type: [String] })
  attributes: string[];

  @Prop({
    type: [mongoose.Types.ObjectId],
    required: true,
    ref: LifestyleInfo.name,
  })
  lifestyleInfo: LifestyleInfoDocument[];

  @Prop({
    type: UserLocation,
    required: false,
  })
  location: UserLocation;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Attachment' })
  profileImage: any;

  @Prop({ required: false })
  biography: string

  @Prop({
    type: SocialLinks,
    required: false,
  })
  social: SocialLinks;

  @Prop({ required: false, default: false })
  isOnline: boolean;

  @Prop({ required: false })
  expoPushToken: string;

  @Prop({ required: false, type: String })
  businessAddress: string;

  @Prop({ required: false, type: Boolean, default: false })
  pregenerated: boolean;

  @Prop({ required: false, type: String })
  businessCity: string;
  @Prop({ required: false, type: String })
  businessState: string;
  @Prop({ required: false, type: String })
  businessCategory: string;
  @Prop({ required: false, type: String })
  businessType: string;
  @Prop({ required: false, type: String })
  businessNiche: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ location: '2dsphere' });
