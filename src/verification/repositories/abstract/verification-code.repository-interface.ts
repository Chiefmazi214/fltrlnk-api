import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { VerificationCodeDocument } from "src/verification/models/verification-code.model";

export const VerificationCodeRepositoryInterface = 'VerificationCodeRepositoryInterface';

export interface VerificationCodeRepositoryInterface extends BaseRepository<VerificationCodeDocument> {
}

