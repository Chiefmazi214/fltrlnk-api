import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Attachment, AttachmentDocument } from "src/attachment/models/attachment.model";
import { User, UserDocument } from "src/user/models/user.model";


@Schema({timestamps: true, collection: "galleries"})
export class Gallery {
    @Prop({ ref: User.name, type: mongoose.Schema.Types.ObjectId})
    user: UserDocument;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Attachment.name})
    attachments: AttachmentDocument[];
}

export type GalleryDocument = HydratedDocument<Gallery>;
export const GallerySchema = SchemaFactory.createForClass(Gallery);