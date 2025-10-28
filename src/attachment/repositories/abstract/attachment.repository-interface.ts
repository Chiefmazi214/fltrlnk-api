import { AttachmentDocument } from "src/attachment/models/attachment.model";
import { BaseRepository } from "src/common/repository/abstract/base.repository";

export const AttachmentRepositoryInterface = 'AttachmentRepositoryInterface';

export interface AttachmentRepositoryInterface extends BaseRepository<AttachmentDocument> {
}