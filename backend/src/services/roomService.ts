import { BaseService } from "../abstract/BaseService";
import { Room } from "../interfaces/room";
import { RoomRepository } from "../repository/roomRepository";
import { logger } from "../middlewares/log";

export class RoomService extends BaseService<Room> {
    protected repository: RoomRepository;
    constructor() {
        const repository = new RoomRepository();
        super(repository);
        this.repository = repository;
    }


    public async getRoom(roomCode: string): Promise<Room | null> {
        if (!roomCode || typeof roomCode !== 'string') {
            logger.warn(`[Service] Invalid roomCode provided: ${roomCode}`);
            return null;
        }

        const numericCode = Number(roomCode);
        
        // 檢查轉換後是否為有效數字
        if (isNaN(numericCode)) {
            logger.warn(`[Service] roomCode cannot be converted to number: ${roomCode}`);
            return null;
        }

        return await this.repository.getRoom(numericCode);
    }

    public async createRoom(hostId: string): Promise<Room> {
        return await this.repository.createRoom(hostId);
    }

    public async deleteRoom(roomCode: string): Promise<boolean> {
        return await this.repository.deleteRoom(Number(roomCode));
    }

    public async isSocketInRoom(socketId: string): Promise<boolean> {
        const room = await this.repository.findRoomBySocketId(socketId);
        return !!room;
    }

    public async findRoomBySocketId(socketId: string): Promise<Room | null> {
        return await this.repository.findRoomBySocketId(socketId);
    }

    public async addPlayer(roomCode: string, playerId: string, name: string, avatar: string): Promise<Room | null> {
        const codeNumber = Number(roomCode);
        if (isNaN(codeNumber) || !roomCode) return null;
        return await this.repository.addPlayer(codeNumber, playerId, name, avatar);
    }

    public async removePlayer(roomCode: string, playerId: string): Promise<Room | null> {
        return await this.repository.removePlayer(Number(roomCode), playerId);
    }

    public async startGame(roomCode: string): Promise<Room | null> {
        return await this.repository.startGame(Number(roomCode));
    }

    public async submitVote(roomCode: string, playerId: string, optionId: string): Promise<Room | null> {
        const codeNumber = Number(roomCode);
        if (isNaN(codeNumber)) return null;

        return await this.repository.submitVote(codeNumber, playerId, optionId);
    }

    public async updateCurrentScenario(roomCode: string, scenarioId: string): Promise<Room | null> {
        const codeNumber = Number(roomCode);
        if (isNaN(codeNumber)) return null;
        
        return await this.repository.updateCurrentScenario(codeNumber, scenarioId);
    }

    public async concludeVoting(roomCode: string, nextScenarioId: string | null): Promise<Room | null> {
        const codeNumber = Number(roomCode);
        if (isNaN(codeNumber)) return null;
        return await this.repository.clearVotesAndSetScenario(codeNumber, nextScenarioId);
    }

    public async resetRoom(roomCode: string): Promise<Room | null> {
        return await this.repository.resetRoom(roomCode);
    }

    /**
     * 房主踢人邏輯
     * @param hostId 發起請求的 Socket ID (必須是房主)
     * @param targetPlayerId 被踢的 Socket ID
     */
    public async kickPlayer(hostId: string, targetPlayerId: string): Promise<{ room: Room, kickedPlayerId: string } | null> {
        const room = await this.repository.findRoomByHostId(hostId);
        if (!room) {
            throw new Error("只有房主有權限踢人，或房間不存在");
        }

        const playerExists = room.players.some(p => p.id === targetPlayerId);
        if (!playerExists) {
            throw new Error("目標玩家不在房間內");
        }

        const updatedRoom = await this.repository.removePlayer(room.code, targetPlayerId);
        
        if (!updatedRoom) return null;

        return { room: updatedRoom, kickedPlayerId: targetPlayerId };
    }
}