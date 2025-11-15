import {Model, Document} from 'mongoose';
import { BaseRepository } from './BaseRepository';

export abstract class BaseService<T extends Document> {
    protected repository: BaseRepository<T>;

    constructor(repository: BaseRepository<T>) {
        this.repository = repository;
    }

    async create(item: Partial<T>): Promise<T> {
        return await this.repository.create(item);
    }

    async findById(id: string): Promise<T | null> {
        return await this.repository.findById(id);
    }

    async findAll(): Promise<T[]> {
        return await this.repository.findAll();
    }

    async update(id: string, item: Partial<T>): Promise<T | null> {
        return await this.repository.update(id, item);
    }

    async delete(id: string): Promise<T | null> {
        return await this.repository.delete(id);
    }
    
}