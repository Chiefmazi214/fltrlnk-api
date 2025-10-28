import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { ConnectionDocument } from "src/connection/models/connection.model";

export const ConnectionRepositoryInterface = 'ConnectionRepositoryInterface';

export interface ConnectionRepositoryInterface extends BaseRepository<ConnectionDocument> {
    findPendingByRequester(requester: string): Promise<ConnectionDocument>;
    findPendingByRecipient(recipient: string): Promise<ConnectionDocument>;
}
