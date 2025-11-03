import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Post } from 'src/post/models/post.model';
import { User } from 'src/user/models/user.model';

@Schema({ timestamps: true, collection: 'likes' })
export class Like {
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
  targetUser: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['profile', 'post'],
    default: 'profile',
  })
  type: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: Post.name,
  })
  post: mongoose.Types.ObjectId;
}

export type LikeDocument = HydratedDocument<Like>;
export const LikeSchema = SchemaFactory.createForClass(Like);
