import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({collection: "comments", timestamps: true})
export class Comment {
    @Prop({required: true, type: Types.ObjectId, ref: 'User'})
    user: Types.ObjectId;

    @Prop({required: true, type: Types.ObjectId, ref: 'Post'})
    post: Types.ObjectId;

    @Prop({required: true})
    content: string;
}

export type CommentDocument = HydratedDocument<Comment>;
export const CommentSchema = SchemaFactory.createForClass(Comment);

