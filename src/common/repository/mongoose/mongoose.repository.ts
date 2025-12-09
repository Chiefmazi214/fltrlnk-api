import { Model, Document } from 'mongoose';
import { BaseRepository, PopulationOptions, PaginationOptions } from '../abstract/base.repository';

export class MongooseRepositoryBase<T extends Document> implements BaseRepository<T> {
  constructor(private readonly model: Model<T>) {}

  async create(data: Partial<T>, populate?: PopulationOptions[]): Promise<T> {
    const document = new this.model(data);
    const saved = (await document.save());
    if (populate) {
      return this.populateDocument(saved, populate);
    }
    return saved;
  }

  async createMany(data: Partial<T>[]): Promise<T[]> {
    return this.model.insertMany(data) as unknown as T[];
  }

  async findById(id: string, populate?: PopulationOptions[]): Promise<T | null> {
    const query = this.model.findById(id);
    if (populate) {
      this.applyPopulation(query, populate);
    }
    return query.exec();
  }

  async findOne(filter: object, populate?: PopulationOptions[]): Promise<T | null> {
    const query = this.model.findOne(filter);
    if (populate) {
      this.applyPopulation(query, populate);
    }
    return query.exec();
  }

  async findAll(filter: object = {}, populate?: PopulationOptions[], pagination?: PaginationOptions): Promise<T[]> {
    const query = this.model.find(filter);
    if (populate) {
      this.applyPopulation(query, populate);
    }
    if (pagination) {
      query.skip(pagination.skip || 0).limit(pagination.limit || 10);
    }
    return query.exec();
  }

  async update(id: string, data: Partial<T>, populate?: PopulationOptions[]): Promise<T | null> {
    const query = this.model.findByIdAndUpdate(id, data, { new: true });
    if (populate) {
      this.applyPopulation(query, populate);
    }
    return query.exec();
  }

  async delete(id: string): Promise<T | null> {
    const query = this.model.findByIdAndDelete(id);
    return query.exec();
  }

  async count(filter: object = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  private async populateDocument(document: T, populate: PopulationOptions[]): Promise<T> {
    return this.model.populate(document, populate)
  }

  private applyPopulation(query: any, populate: PopulationOptions[]): void {
    populate.forEach(option => {
      query.populate(option.path, option.select);
    });
  }
}
