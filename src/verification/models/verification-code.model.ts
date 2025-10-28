import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "src/user/models/user.model";

@Schema({ timestamps: true, collection: 'verification-codes' })
export class VerificationCode{

    @Prop({ required: true, type: String, length: 6 })
    code: string;

    @Prop({type: Boolean, default: false })
    isVerified: boolean;

    @Prop({ required: true, type: String })
    type: VerificationCodeTypes;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    userId: string;

    @Prop({ type: Date })
    expiresAt: Date;
}

export enum VerificationCodeTypes {
    EMAIL="EMAIL",
    PHONE="PHONE",
    PASSWORD_RESET="PASSWORD_RESET",
    FORGOT_PASSWORD="FORGOT_PASSWORD"
}

export type VerificationCodeDocument = HydratedDocument<VerificationCode>;
export const VerificationCodeSchema = SchemaFactory.createForClass(VerificationCode);