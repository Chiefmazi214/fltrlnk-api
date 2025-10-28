import { BaseRepository } from "src/common/repository/abstract/base.repository";
import { GalleryDocument } from "src/gallery/models/gallery.model";

export const GalleryRepositoryInterface = 'GalleryRepositoryInterface';

export interface GalleryRepositoryInterface extends BaseRepository<GalleryDocument> {
}
