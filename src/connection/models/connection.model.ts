import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { Attachment, AttachmentDocument } from "src/attachment/models/attachment.model";
import { User, UserDocument } from "src/user/models/user.model";

export enum ConnectionStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

@Schema({ timestamps: true, collection: "connections" })
export class Connection {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    requester: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    recipient: string;

    @Prop({ type: String, required: false, maxlength: 200 })
    message: string;
    
    @Prop({ enum: ConnectionStatus, default: ConnectionStatus.PENDING })
    status: ConnectionStatus;
}

export type ConnectionDocument = HydratedDocument<Connection>;
export const ConnectionSchema = SchemaFactory.createForClass(Connection);