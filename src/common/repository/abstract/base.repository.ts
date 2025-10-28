export interface PopulationOptions {
    path: string;
    select?: string;
    match?: object;
}

export interface PaginationOptions {
    skip?: number;
    limit?: number;
}

export interface BaseRepository<T> {
    create(data: Partial<T>, populate?: PopulationOptions[]): Promise<T>;
    findById(id: string, populate?: PopulationOptions[]): Promise<T | null>;
    findOne(filter: object, populate?: PopulationOptions[]): Promise<T | null>;
    findAll(filter?: object, populate?: PopulationOptions[], pagination?: PaginationOptions): Promise<T[]>;
    update(id: string, data: Partial<T>, populate?: PopulationOptions[]): Promise<T | null>;
    delete(id: string): Promise<T | null>;
    count(filter?: object): Promise<number>;
}