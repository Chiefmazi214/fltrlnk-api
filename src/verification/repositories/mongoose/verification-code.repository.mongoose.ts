import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { VerificationCode, VerificationCodeDocument } from "src/verification/models/verification-code.model";
import { VerificationCodeRepositoryInterface } from "../abstract/verification-code.repository-interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class VerificationCodeRepository extends MongooseRepositoryBase<VerificationCodeDocument> implements VerificationCodeRepositoryInterface {
    constructor(@InjectModel(VerificationCode.name) private verificationCodeModel: Model<VerificationCodeDocument>) {
        super(verificationCodeModel);
    }
}
