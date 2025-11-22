import { model, Schema } from 'mongoose';

export const playerSchema = new Schema({
    id: { type: String, required: true },
    avatar: { type: String, required: true },
    name: { type: String, required: true }
}, { _id: false });