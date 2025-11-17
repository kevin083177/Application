import { Document } from 'mongoose';

export interface Room extends Document {
    code: number;
    hostId: string;
    players: string[];
    status: 'waiting' | 'playing' | 'ended';
    currentScenarioId: string | null;
    created_at?: string;
    closed_at?: string;
}