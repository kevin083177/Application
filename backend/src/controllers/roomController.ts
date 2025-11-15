import { Socket, Server } from "socket.io";
import { RoomService } from "../services/roomService";
import { logger } from "../middlewares/log";
import { Room } from "../interfaces/room";
import { SocketHelper } from "../utils/sockets/socketResponse";

export class RoomController {
    protected service: RoomService;
    private io?: Server;

    constructor() {
        this.service = new RoomService();
    }

    /**
     * 設定 Socket.IO Server (用於廣播)
     */
    public setSocketIO(io: Server): void {
        this.io = io;
    }

    /**
     * 建立房間
     * Event: "room:create"
     */
    public createRoom = async (socket: Socket, io: Server) => {
        try {
            const isInRoom = await this.service.isSocketInRoom(socket.id);
            if (isInRoom) {
                SocketHelper.sendError(socket, "room:error", "你已經在一個房間了，不能重複建立");
                return;
            }

            const newRoom = await this.service.createRoom(socket.id);
            socket.join(newRoom.code.toString());

            SocketHelper.send(socket, "room:created", {
                code: newRoom.code,
                hostId: newRoom.hostId,
                players: newRoom.players,
                gameStarted: newRoom.gameStarted
            }, "房間建立成功");

            logger.info(`[Controller] Room ${newRoom.code} created by ${socket.id}`);
        } catch (error: any) {
            SocketHelper.sendError(socket, "room:error", error.message || "無法建立房間");
            logger.error(`[Controller] createRoom error:`, error);
        }
    }

    /**
     * 加入房間
     * Event: "room:join"
     * Data: roomCode (string)
     */
    public joinRoom = async (socket: Socket, io: Server, roomCode: string) => {
        try {
            const result = await this._joinRoomLogic(roomCode, socket.id);
    
            if (!result.success) {
                SocketHelper.sendError(socket, "room:error", result.message || "無法加入房間");
                return;
            }

            const room = result.room!;
            socket.join(room.code.toString());

            // 通知自己加入成功
            SocketHelper.send(socket, "room:joined", room, "加入房間成功");

            // 通知房間內其他人
            SocketHelper.broadcast(socket, room.code.toString(), "player:joined", {
                playerId: socket.id,
                players: room.players
            }, "有新玩家加入");

            logger.info(`[Controller] Player ${socket.id} joined room ${roomCode}`);
        } catch (error: any) {
            SocketHelper.sendError(socket, "room:error", "無法加入房間");
            logger.error(`[Controller] joinRoom error:`, error);
        }
    }

    /**
     * 開始遊戲
     * Event: "game:start"
     */
    public startGame = async (socket: Socket, io: Server) => {
        try {
            const room = await this.service.findRoomBySocketId(socket.id);
            if (!room) {
                SocketHelper.sendError(socket, "room:error", "你不在任何房間內");
                return;
            }

            const result = await this._startGameLogic(room.code.toString(), socket.id);
            if (!result.success) {
                SocketHelper.sendError(socket, "room:error", result.message || "無法開始遊戲");
                return;
            }

            SocketHelper.ioEmit(io, room.code.toString(), "game:started", {
                room: result.room
            }, "遊戲已開始");

            logger.info(`[Controller] Game started in room ${room.code}`);
        } catch (error: any) {
            SocketHelper.sendError(socket, "room:error", "無法開始遊戲");
            logger.error(`[Controller] startGame error:`, error);
        }
    }

    /**
     * 處理斷線
     * Event: "disconnect"
     */
    public handleDisconnect = async (socket: Socket, io: Server) => {
        try {
            const room = await this.service.findRoomBySocketId(socket.id);
            if (!room) {
                return;
            }

            const roomCode = room.code.toString();

            if (room.hostId === socket.id) {
                // 房主離線，解散房間
                await this.service.deleteRoom(roomCode);

                SocketHelper.ioEmit(io, roomCode, "room:closed", null, "房主已離線，房間已解散");

                logger.info(`[Controller] Room ${roomCode} closed (host disconnected)`);
            } else {
                // 玩家離線，移除玩家
                const updatedRoom = await this.service.removePlayer(roomCode, socket.id);

                SocketHelper.ioEmit(io, roomCode, "player:left", {
                    playerId: socket.id,
                    players: updatedRoom?.players || []
                }, "玩家已離開");

                logger.info(`[Controller] Player ${socket.id} left room ${roomCode}`);
            }

            // 離開 Socket.IO 房間
            socket.leave(roomCode);
        } catch (error: any) {
            logger.error(`[Controller] handleDisconnect error:`, error);
        }
    }

    /**
     * 離開房間 (主動)
     * Event: "room:leave"
     */
    public leaveRoom = async (socket: Socket, io: Server) => {
        await this.handleDisconnect(socket, io);
    }

    // ==================== Private Helper Methods ====================

    /**
     * 加入房間的驗證邏輯
     * @private
     */
    private async _joinRoomLogic(roomCode: string, playerId: string): Promise<{
        success: boolean;
        room?: Room;
        message?: string;
        errorType?: string;
    }> {
        try {
            // 1. 檢查是否為 undefined、null 或空字串
            if (roomCode === undefined || roomCode === null || roomCode === '') {
                logger.warn(`[Controller] Invalid roomCode: empty or undefined`);
                return {
                    success: false,
                    message: '無效的房間號碼',
                    errorType: 'badRequest'
                };
            }

            // 2. 轉換為字串並去除空白
            const trimmedCode = String(roomCode).trim();

            // 3. 檢查是否為純數字且長度為 6
            if (!/^\d{6}$/.test(trimmedCode)) {
                logger.warn(`[Controller] Invalid roomCode format: ${trimmedCode}`);
                return {
                    success: false,
                    message: '房間號碼必須為 6 位數字',
                    errorType: 'badRequest'
                };
            }

            // 4. 檢查是否已在房間
            const isInRoom = await this.service.isSocketInRoom(playerId);
            if (isInRoom) {
                return {
                    success: false,
                    message: '你已經在一個房間了',
                    errorType: 'conflict'
                };
            }

            // 5. 檢查房間是否存在
            const room = await this.service.getRoom(trimmedCode);
            if (!room) {
                logger.warn(`[Controller] Room not found: ${trimmedCode}`);
                return {
                    success: false,
                    message: '房間不存在',
                    errorType: 'notFound'
                };
            }

            // 6. 檢查是否為房主
            if (room.hostId === playerId) {
                return {
                    success: false,
                    message: '房主不能加入自己的房間',
                    errorType: 'badRequest'
                };
            }

            // 7. 檢查遊戲是否已開始
            if (room.gameStarted) {
                return {
                    success: false,
                    message: '遊戲已開始，無法加入',
                    errorType: 'conflict'
                };
            }

            // 8. 加入房間
            const updatedRoom = await this.service.addPlayer(trimmedCode, playerId);
            if (!updatedRoom) {
                logger.error(`[Controller] Failed to add player ${playerId} to room ${trimmedCode}`);
                return {
                    success: false,
                    message: '加入房間失敗',
                    errorType: 'badRequest'
                };
            }

            return {
                success: true,
                room: updatedRoom
            };
        } catch (error: any) {
            logger.error(`[Controller] _joinRoomLogic internal error:`, error);
            return {
                success: false,
                message: '伺服器內部錯誤，無法加入房間',
                errorType: 'internalError'
            };
        }
    }

    /**
     * 開始遊戲的驗證邏輯
     * @private
     */
    private async _startGameLogic(roomCode: string, hostId: string): Promise<{
        success: boolean;
        room?: Room;
        message?: string;
        errorType?: string;
    }> {
        const room = await this.service.getRoom(roomCode);
        if (!room) {
            return {
                success: false,
                message: '房間不存在',
                errorType: 'notFound'
            };
        }

        if (room.hostId !== hostId) {
            return {
                success: false,
                message: '只有房主才能開始遊戲',
                errorType: 'forbidden'
            };
        }

        if (room.players.length < 2) {
            return {
                success: false,
                message: '至少需要 2 個玩家才能開始遊戲',
                errorType: 'badRequest'
            };
        }

        const updatedRoom = await this.service.startGame(roomCode);
        if (!updatedRoom) {
            return {
                success: false,
                message: '開始遊戲失敗',
                errorType: 'badRequest'
            };
        }

        return {
            success: true,
            room: updatedRoom
        };
    }
}