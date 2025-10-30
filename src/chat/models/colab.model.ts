import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/user/models/user.model';
import { ColabStatus } from '../chat.types';

@Schema({ timestamps: true, collection: 'colabs' })
export class Colab {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  user: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  collaborator: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({
    type: String,
    required: true,
    enum: ColabStatus,
    default: ColabStatus.PENDING,
  })
  status: ColabStatus;
}

export type ColabDocument = HydratedDocument<Colab>;
export const ColabSchema = SchemaFactory.createForClass(Colab);
