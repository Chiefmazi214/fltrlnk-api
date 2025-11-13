import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BusinessType } from "../business.enum";

@Schema({ collection: "businesses", timestamps: true })
export class Business {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    user: Types.ObjectId;

    @Prop({ required: false })
    companyName: string;

    @Prop({ required: false })
    phone: string;

    @Prop({ required: false })
    website: string;

    @Prop({ required: false, type: String })
    miniProfileBio: string;

    @Prop({ required: false, type: String })
    radarProfileBio: string;

    @Prop({ type: String, enum: Object.values(BusinessType) })
    businessType: BusinessType;

    @Prop({ required: false, type: String })
    category: string;

    @Prop({ required: false, type: String })
    state: string;

    @Prop({ required: false, type: String })
    niche: string;

    @Prop({
        type: Map,
        of: {
            open: { type: String, required: function () { return !this.isClosed; } },
            close: { type: String, required: function () { return !this.isClosed; } },
            isClosed: { type: Boolean, default: false }
        },
        default: {
            monday: { open: '09:00', close: '18:00', isClosed: false },
            tuesday: { open: '09:00', close: '18:00', isClosed: false },
            wednesday: { open: '09:00', close: '18:00', isClosed: false },
            thursday: { open: '09:00', close: '18:00', isClosed: false },
            friday: { open: '09:00', close: '18:00', isClosed: false },
            saturday: { open: '09:00', close: '18:00', isClosed: false },
            sunday: { open: '09:00', close: '18:00', isClosed: true }
        }
    })
    workingHours: Map<string, any>;

    @Prop({ required: false, type: Number })
    minPrice: number;

    @Prop({ required: false, type: Number })
    maxPrice: number;

    @Prop({ required: false, type: Boolean, default: true })
    mapDiscovery: boolean;

}

export type BusinessDocument = HydratedDocument<Business>;
export const BusinessSchema = SchemaFactory.createForClass(Business);
