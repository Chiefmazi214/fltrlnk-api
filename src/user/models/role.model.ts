import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum RoleEnum {
    USER = 'USER',
    ADMIN = 'ADMIN',
    INDIVIDUAL = 'INDIVIDUAL',
    BUSINESS = 'BUSINESS',
}

@Schema({ timestamps: true })
export class Role {
    @Prop({ type: String, required: true })
    name: RoleEnum;
}

export type RoleDocument = HydratedDocument<Role>;
export const RoleSchema = SchemaFactory.createForClass(Role);