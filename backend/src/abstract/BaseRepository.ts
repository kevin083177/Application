import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(item: Partial<T>): Promise<T> {
        const newItem = new this.model(item);
        return await newItem.save();
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id).exec();
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return await this.model.findOne(filter).exec();
    }

    async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
        return await this.model.find(filter).exec();
    }

    async update(id: string, item: UpdateQuery<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, item, { new: true }).exec();
    }

    async delete(id: string): Promise<T | null> {
        return await this.model.findByIdAndDelete(id).exec();
    }

    async exists(filter: FilterQuery<T>): Promise<boolean> {
        const count = await this.model.countDocuments(filter).exec();
        return count > 0;
    }
}