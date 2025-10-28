import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { LifestyleInfoDocument } from "src/user/models/lifestyle-info.model";

export const LifestyleInfoRepositoryInterface = 'LifestyleInfoRepositoryInterface';

export interface LifestyleInfoRepositoryInterface extends BaseRepository<LifestyleInfoDocument> {
}
