import type { Player } from "./Player";

export interface Room {
    code: number;
    hostId: string;
    players: Player[];
    status: 'waiting' | 'playing' | 'ended';
    currentScenarioId?: string | null;
    currentVotes?: Map<string, string>; // key: playerId, value: optionId
    created_at?: string;
    closed_at?: string;
}