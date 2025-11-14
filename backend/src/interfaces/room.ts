export interface Room {
    code: number;
    hostId: string;
    players: string[];
    gameStarted: boolean;
    created_at?: string;
    closed_at?: string;
}