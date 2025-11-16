import { logger } from "../middlewares/log";
import { Room } from "../interfaces/room";
import { RoomModel } from "../models/roomSchema";
import { BaseRepository } from "../abstract/BaseRepository";

export class RoomRepository extends BaseRepository<Room> {
    constructor() {
        super(RoomModel);
    }

    /**
     * 生成唯一的 6 位數房間代碼
     * @private
     * @returns {Promise<number>} 唯一的房間代碼
     */
    private async _generateRoomCode(): Promise<number> {
        let code: number;
        let exists: boolean;

        do {
            code = Math.floor(100000 + Math.random() * 900000);
            exists = await this.exists({ code: code });
        } while (exists);

        return code;
    }

    /**
     * 根據房間代碼更新房間
     * @param {number} roomCode - 房間代碼
     * @param {Partial<Room>} updateData - 要更新的資料
     * @returns {Promise<Room | null>} 更新後的房間或 null
     */
    private async updateByCode(roomCode: number, updateData: any): Promise<Room | null> {
        try {
            const updatedRoom = await this.model.findOneAndUpdate(
                { code: roomCode },
                updateData,
                { new: true }
            ).exec();
            return updatedRoom;
        } catch (error) {
            logger.error(`[Repository] Error updating room ${roomCode}:`, error);
            return null;
        }
    }

    /**
     * 根據房間代碼刪除房間
     * @param {number} roomCode - 房間代碼
     * @returns {Promise<boolean>} 是否成功刪除
     */
    private async deleteByCode(roomCode: number): Promise<boolean> {
        try {
            const result = await this.model.findOneAndDelete({ code: roomCode }).exec();
            return result !== null;
        } catch (error) {
            logger.error(`[Repository] Error deleting room ${roomCode}:`, error);
            return false;
        }
    }

    /**
     * 根據房間代碼取得房間
     * @param {number} roomCode - 房間代碼
     * @returns {Promise<Room | null>} 房間資料或 null
     */
    public async getRoom(roomCode: number): Promise<Room | null> {
        return await this.findOne({ code: roomCode });
    }

    /**
     * 根據房間代碼取得房間 (字串版本)
     * @param {string} roomCode - 房間代碼 (字串)
     * @returns {Promise<Room | null>} 房間資料或 null
     */
    public async getRoomByCode(roomCode: string): Promise<Room | null> {
        return await this.findOne({ code: Number(roomCode) });
    }

    /**
     * 建立新房間
     * @param {string} hostId - 房主的 Socket ID
     * @returns {Promise<Room>} 新建立的房間
     */
    public async createRoom(hostId: string): Promise<Room> {
        const roomCode = await this._generateRoomCode();

        const newRoom = await this.create({
            code: roomCode,
            hostId: hostId,
            players: [hostId],
            gameStarted: false
        } as Partial<Room>);

        logger.info(`[Repository] Room created with code: ${roomCode} by host: ${hostId}`);
        return newRoom;
    }

    /**
     * 根據房間代碼刪除房間
     * @param {number} roomCode - 房間代碼
     * @returns {Promise<boolean>} 是否成功刪除
     */
    public async deleteRoom(roomCode: number): Promise<boolean> {
        const deleted = await this.deleteByCode(roomCode);

        if (deleted) {
            logger.info(`[Repository] Room ${roomCode} deleted`);
        } else {
            logger.warn(`[Repository] Room ${roomCode} not found for deletion`);
        }

        return deleted;
    }

    /**
     * 根據 Socket ID 查找房間 (房主或玩家)
     * @param {string} socketId - Socket ID
     * @returns {Promise<Room | null>} 房間資料或 null
     */
    public async findRoomBySocketId(socketId: string): Promise<Room | null> {
        return await this.findOne({
            $or: [
                { hostId: socketId },
                { players: socketId }
            ]
        });
    }

    /**
     * 根據房主 ID 查找房間
     * @param {string} hostId - 房主的 Socket ID
     * @returns {Promise<Room | null>} 房間資料或 null
     */
    public async findRoomByHostId(hostId: string): Promise<Room | null> {
        return await this.findOne({ hostId: hostId });
    }

    /**
     * 將玩家加入房間
     * @param {number} roomCode - 房間代碼
     * @param {string} playerId - 玩家的 Socket ID
     * @returns {Promise<Room | null>} 更新後的房間或 null
     */
    public async addPlayer(roomCode: number, playerId: string): Promise<Room | null> {
        return await this.model.findOneAndUpdate(
            { code: roomCode, gameStarted: false }, // 確保遊戲未開始
            { $addToSet: { players: playerId } },   // 使用 $addToSet 避免重複加入
            { new: true }                           // 返回更新後的文檔
        ).exec();
    }

    /**
     * 將玩家從房間移除
     * @param {number} roomCode - 房間代碼
     * @param {string} playerId - 玩家的 Socket ID
     * @returns {Promise<Room | null>} 更新後的房間或 null
     */
    public async removePlayer(roomCode: number, playerId: string): Promise<Room | null> {
        const updatedRoom = await this.updateByCode(
            roomCode,
            { $pull: { players: playerId } }
        );

        if (updatedRoom) {
            logger.info(`[Repository] Player ${playerId} left room ${roomCode}`);
        }

        return updatedRoom;
    }

    /**
     * 開始遊戲
     * @param {number} roomCode - 房間代碼
     * @returns {Promise<Room | null>} 更新後的房間或 null
     */
    public async startGame(roomCode: number): Promise<Room | null> {
        const updatedRoom = await this.updateByCode(
            roomCode,
            { gameStarted: true }
        );

        if (updatedRoom) {
            logger.info(`[Repository] Game started in room ${roomCode}`);
        }

        return updatedRoom;
    }

    /**
     * 檢查玩家是否在任何房間中
     * @param {string} socketId - Socket ID
     * @returns {Promise<boolean>} 是否在房間中
     */
    public async isPlayerInRoom(socketId: string): Promise<boolean> {
        return await this.exists({
            $or: [
                { hostId: socketId },
                { players: socketId }
            ]
        });
    }

    /**
     * 取得所有進行中的遊戲房間
     * @returns {Promise<Room[]>} 進行中的房間列表
     */
    public async getActiveRooms(): Promise<Room[]> {
        return await this.findAll({ gameStarted: true });
    }

    /**
     * 取得所有等待中的房間
     * @returns {Promise<Room[]>} 等待中的房間列表
     */
    public async getWaitingRooms(): Promise<Room[]> {
        return await this.findAll({ gameStarted: false });
    }

    /**
     * 取得房間內的玩家數量
     * @param {number} roomCode - 房間代碼
     * @returns {Promise<number>} 玩家數量
     */
    public async getPlayerCount(roomCode: number): Promise<number> {
        const room = await this.getRoom(roomCode);
        return room ? room.players.length : 0;
    }

    /**
     * 取得所有房間
     * @returns {Promise<Room[]>} 所有房間列表
     */
    public async getAllRooms(): Promise<Room[]> {
        return await this.findAll();
    }

    /**
     * 檢查房間是否存在
     * @param {number} roomCode - 房間代碼
     * @returns {Promise<boolean>} 房間是否存在
     */
    public async roomExists(roomCode: number): Promise<boolean> {
        return await this.exists({ code: roomCode });
    }
}