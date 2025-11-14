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
    gameStarted: {
        type: Boolean,
        default: false
    }
})

export const RoomModel = model<Room>('room', roomSchema);