import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { Attachment, AttachmentDocument } from "src/attachment/models/attachment.model";
import { CommentDocument } from "./comment.model";

@Schema({_id: false})
export class PostLocation {
    @Prop({
        type: String,
        enum: ['Point'],
        required: true
    })
    type: string;

    @Prop({
        type: [Number],
        required: true,
        validate: {
            validator: function(v: number[]) {
                return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
            },
            message: 'Coordinates must be [longitude, latitude] with valid ranges'
        }
    })
    coordinates: number[];

    @Prop({required: false, type: String})
    address: string;

    @Prop({required: false, type: String})
    title: string;
}

export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    DELETED = 'deleted'
}

@Schema({collection: "posts", timestamps: true})
export class Post {
    @Prop({required: true, type: Types.ObjectId, ref: 'User'})
    user: Types.ObjectId;

    @Prop({required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'User'})
    likes: Types.ObjectId[];

    @Prop({required: false, type: [mongoose.Schema.Types.ObjectId], ref: 'Comment'})
    comments: CommentDocument[];

    @Prop({required: true})
    description: string;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Attachment.name})
    attachments: AttachmentDocument[];

    @Prop({
        type: PostLocation,
        required: false,
        index: '2dsphere'
    })
    location: PostLocation;

    @Prop({required: true, enum: PostStatus, default: PostStatus.DRAFT})
    status: PostStatus;
}

export type PostDocument = HydratedDocument<Post>;
export const PostSchema = SchemaFactory.createForClass(Post);
