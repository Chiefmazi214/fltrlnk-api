import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { ColabDocument } from "src/chat/models/colab.model";

export const ColabRepositoryInterface = 'ColabRepositoryInterface';

export interface ColabRepositoryInterface extends BaseRepository<ColabDocument> {
}
