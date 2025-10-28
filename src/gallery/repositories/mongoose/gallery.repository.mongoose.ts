import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseRepositoryBase } from "src/common/repository/mongoose/mongoose.repository";
import { Gallery, GalleryDocument } from "src/gallery/models/gallery.model";
import { GalleryRepositoryInterface } from "../abstract/gallery.repository-interface";

export class GalleryRepository extends MongooseRepositoryBase<GalleryDocument> implements GalleryRepositoryInterface {
    constructor(@InjectModel(Gallery.name) private galleryModel: Model<GalleryDocument>) {
        super(galleryModel);
    }
}
