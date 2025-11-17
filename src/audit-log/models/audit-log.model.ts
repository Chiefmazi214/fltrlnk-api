import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { AuditAction, EntityType } from '../audit-log.enum';
import { User } from 'src/user/models/user.model';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ _id: false })
export class AuditMetadata {
  @Prop({ type: String, required: false })
  ipAddress?: string;

  @Prop({ type: String, required: false })
  userAgent?: string;

  @Prop({ type: Object, required: false })
  additionalInfo?: Record<string, any>;
}

@Schema({ collection: 'audit_logs', timestamps: true })
export class AuditLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: false })
  userId?: string;

  @Prop({ type: String, enum: Object.values(AuditAction), required: true })
  action: AuditAction;

  @Prop({ type: String, enum: Object.values(EntityType), required: true })
  entityType: EntityType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false })
  entityId?: string;

  @Prop({ type: String, required: false })
  entityName?: string;

  @Prop({ type: Object, required: false })
  oldValue?: Record<string, any>;

  @Prop({ type: Object, required: false })
  newValue?: Record<string, any>;

  @Prop({ type: Object, required: false })
  changes?: Record<string, any>;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: AuditMetadata, required: false })
  metadata?: AuditMetadata;

  @Prop({ type: Boolean, default: false })
  isSystem: boolean;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Create indexes for efficient querying
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });
