import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { FollowStatus } from "../like.enum";

@Schema({ timestamps: true, collection: "follows" })
export class Follow {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    follower: Types.ObjectId | string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    following: Types.ObjectId | string;

    @Prop({ enum: FollowStatus, default: FollowStatus.PENDING })
    status: FollowStatus;
}

export type FollowDocument = HydratedDocument<Follow>;
export const FollowSchema = SchemaFactory.createForClass(Follow);
