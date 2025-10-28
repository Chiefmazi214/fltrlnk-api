import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true, collection: "follows" })
export class Follow {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    follower: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    following: string;
}

export type FollowDocument = HydratedDocument<Follow>;
export const FollowSchema = SchemaFactory.createForClass(Follow);
