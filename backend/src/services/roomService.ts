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
        // ✅ 加入防禦性檢查
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

    public async addPlayer(roomCode: string, playerId: string): Promise<Room | null> {
        // ✅ 防禦性檢查：確保 roomCode 是有效的數字字串
        const codeNumber = Number(roomCode);
        if (isNaN(codeNumber) || !roomCode || roomCode.trim().length === 0) {
            return null;
        }
        return await this.repository.addPlayer(codeNumber, playerId);
    }

    public async removePlayer(roomCode: string, playerId: string): Promise<Room | null> {
        return await this.repository.removePlayer(Number(roomCode), playerId);
    }

    public async startGame(roomCode: string): Promise<Room | null> {
        return await this.repository.startGame(Number(roomCode));
    }
}