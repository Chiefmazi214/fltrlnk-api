import { PipelineStage } from "mongoose";
import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { FollowDocument } from "src/connection/models/follow.model";

export const FollowRepositoryInterface = 'FollowRepositoryInterface';

export interface FollowRepositoryInterface extends BaseRepository<FollowDocument> {
    aggregate(pipeline: PipelineStage[]): Promise<any[]>;
}
