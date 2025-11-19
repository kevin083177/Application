import { Document } from 'mongoose';

export interface Room extends Document {
    code: number;
    hostId: string;
    players: string[];
    status: 'waiting' | 'playing' | 'ended';
    currentScenarioId: string | null;
    currentVotes: Map<string, string>; // key: playerId, value: optionId
    created_at?: string;
    closed_at?: string;
}