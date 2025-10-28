import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Connection, ConnectionDocument, ConnectionStatus } from "src/connection/models/connection.model";
import { ConnectionRepositoryInterface } from "../abstract/connection.repository-interface";

export class ConnectionRepository extends MongooseRepositoryBase<ConnectionDocument> implements ConnectionRepositoryInterface {
    constructor(@InjectModel(Connection.name) private connectionModel: Model<ConnectionDocument>) {
        super(connectionModel);
    }

    async findPendingByRequester(requester: string): Promise<ConnectionDocument> {
        return this.connectionModel.findOne({ requester: new Types.ObjectId(requester), status: ConnectionStatus.PENDING }).exec();
    }

    async findPendingByRecipient(recipient: string): Promise<ConnectionDocument> {
        return this.connectionModel.findOne({ recipient: new Types.ObjectId(recipient), status: ConnectionStatus.PENDING }).exec();
    }
}
