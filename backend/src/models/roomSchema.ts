import { model, Schema } from 'mongoose';
import { Room } from '../interfaces/room';

const roomSchema = new Schema<Room>({
    code: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    hostId: {
        type: String,
        required: true
    },
    players: {
        type: [String], default: []
    },
    status: {
        type: String,
        enum: ['waiting', 'playing', 'ended'],
        default: 'waiting'
    },
    currentScenarioId: {
        type: String,
        ref: 'Scenario',
        default: null
    },
    currentVotes: {
        type: Map,
        of: String,
        default: {}
    },
    created_at: { type: Date, default: Date.now, expires: 7200 }
}, { versionKey: false})

export const RoomModel = model<Room>('room', roomSchema);