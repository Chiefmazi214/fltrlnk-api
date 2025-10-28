import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { RoleDocument } from "src/user/models/role.model";

export const RoleRepositoryInterface = 'RoleRepositoryInterface';

export interface RoleRepositoryInterface extends BaseRepository<RoleDocument> {
}
