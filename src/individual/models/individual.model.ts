import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({collection: "individuals", timestamps: true})
export class Individual {
    @Prop({required: true, type: Types.ObjectId, ref: 'User'})
    user: Types.ObjectId;

    @Prop({required: false})
    biography: string;

    @Prop({ required: true, type: Boolean, default: true })
    mapDiscovery: boolean;

    @Prop({ required: false, type: Boolean, default: true })
    fltrlScreen: boolean;
}

export type IndividualDocument = HydratedDocument<Individual>;
export const IndividualSchema = SchemaFactory.createForClass(Individual);
