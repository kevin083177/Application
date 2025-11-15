import { Document } from 'mongoose';

export interface Room extends Document {
    code: number;
    hostId: string;
    players: string[];
    gameStarted: boolean;
    created_at?: string;
    closed_at?: string;
}