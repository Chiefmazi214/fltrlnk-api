import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export enum AttachmentType {
    PROFILE_IMAGE = 'profile_image',
    DOCUMENT = 'document',
    POST_IMAGE = 'post_image',
}

@Schema({
    collection: 'attachments',
    timestamps: true
})
export class Attachment {

    @Prop({ type: String, required: true })
    filename: string;

    @Prop({ type: String, required: true })
    path: string;

    @Prop({ type: String, required: true })
    type: AttachmentType;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    user?: any;
    
    @Prop({ type: String, required: false })
    url?: string;
}

export type AttachmentDocument = HydratedDocument<Attachment>;
export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
