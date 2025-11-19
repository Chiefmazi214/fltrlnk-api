import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'settings' })
export class Settings {
    @Prop({ type: String, required: true, default: 'FiltrLink Admin' })
    siteName: string;

    @Prop({ type: Number, required: true, default: 12 })
    sessionTimeout: number;

    @Prop({ type: Number, required: true, default: 5 })
    maxLoginAttempts: number;

    @Prop({ type: Boolean, default: false })
    require2FAForAllAdmins: boolean;

    @Prop({ type: Boolean, default: true })
    allowNewAdminRegistration: boolean;
}

export type SettingsDocument = HydratedDocument<Settings>;
export const SettingsSchema = SchemaFactory.createForClass(Settings);
