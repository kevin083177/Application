import { Socket, Server } from "socket.io";
import { RoomService } from "../services/roomService";
import { logger } from "../middlewares/log";
import { Room } from "../interfaces/room";
import { SocketHelper } from "../utils/sockets/socketResponse";
import { ScenarioService } from "../services/scenarioService";

export class RoomController {
    protected service: RoomService;
    protected scenarioService: ScenarioService;
    private io: Server;

    constructor(io: Server) {
        this.service = new RoomService();
        this.scenarioService = new ScenarioService();
        this.io = io;
    }

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
                status: newRoom.status
            }, "房間建立成功");

            logger.info(`[Controller] Room ${newRoom.code} created by ${socket.id}`);
        } catch (error: any) {
            SocketHelper.sendError(socket, "room:error", error.message || "無法建立房間");
            logger.error(`[Controller] createRoom error:`, error);
        }
    }

    public joinRoom = async (socket: Socket, io: Server, data: { roomCode: string, name: string, avatar: string }) => {
        try {
            if (!data || !data.roomCode || !data.name || !data.avatar) {
                SocketHelper.sendError(socket, "room:error", "缺少必要參數 (roomCode, name, avatar)");
                return;
            }

            const result = await this._joinRoomLogic(data.roomCode, socket.id, data.name, data.avatar);
    
            if (!result.success) {
                SocketHelper.sendError(socket, "room:error", result.message || "無法加入房間");
                return;
            }

            const room = result.room!;
            socket.join(room.code.toString());

            SocketHelper.send(socket, "room:joined", room, "加入房間成功");

            SocketHelper.broadcast(socket, room.code.toString(), "player:joined", {
                playerId: socket.id,
                players: room.players
            }, "有新玩家加入");

            logger.info(`[Controller] Player ${data.name} (${socket.id}) joined room ${data.roomCode}`);
        } catch (error: any) {
            SocketHelper.sendError(socket, "room:error", "無法加入房間");
            logger.error(`[Controller] joinRoom error:`, error);
        }
    }

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
     * 處理意外斷線
     * Event: "disconnect"
     */
    public handleDisconnect = async (socket: Socket, io: Server) => {
        try {
            const room = await this.service.findRoomBySocketId(socket.id);
            if (!room) return;

            const roomCode = room.code.toString();

            if (room.hostId === socket.id) {
                // 房主離線，解散房間
                await this.service.deleteRoom(roomCode);
                SocketHelper.ioEmit(io, roomCode, "room:closed", null, "房主已離線，房間已解散");
                logger.info(`[Controller] Room ${roomCode} closed (host disconnected)`);
            } else {
                // 玩家離線
                const updatedRoom = await this.service.removePlayer(roomCode, socket.id);
                SocketHelper.ioEmit(io, roomCode, "player:left", {
                    playerId: socket.id,
                    players: updatedRoom?.players || []
                }, "玩家已離開");
                logger.info(`[Controller] Player ${socket.id} disconnected from room ${roomCode}`);
            }
        } catch (error: any) {
            logger.error(`[Controller] handleDisconnect error:`, error);
        }
    }

    /**
     * 離開房間 (主動)
     * Event: "room:leave"
     */
    public leaveRoom = async (socket: Socket, io: Server) => {
        try {
            const room = await this.service.findRoomBySocketId(socket.id);
            if (!room) {
                 return; 
            }

            const roomCode = room.code.toString();

            if (room.hostId === socket.id) {
                // 房主主動解散房間
                await this.service.deleteRoom(roomCode);
                SocketHelper.ioEmit(io, roomCode, "room:closed", null, "房主解散了房間");
                logger.info(`[Controller] Room ${roomCode} disbanded by host`);
            } else {
                // 玩家主動離開
                const updatedRoom = await this.service.removePlayer(roomCode, socket.id);
                
                // 通知房間內其他人
                SocketHelper.ioEmit(io, roomCode, "player:left", {
                    playerId: socket.id,
                    players: updatedRoom?.players || []
                }, "玩家已離開");
                
                logger.info(`[Controller] Player ${socket.id} left room ${roomCode} voluntarily`);
            }

            socket.leave(roomCode);
            
            SocketHelper.send(socket, "room:left", { success: true }, "已離開房間");

        } catch (error: any) {
            logger.error(`[Controller] leaveRoom error:`, error);
        }
    }

    private async _joinRoomLogic(roomCode: string, playerId: string, name: string, avatar: string) {
        try {
            if (!roomCode) return { success: false, message: '無效房號' };
            const trimmedCode = String(roomCode).trim();
            
            const isInRoom = await this.service.isSocketInRoom(playerId);
            if (isInRoom) return { success: false, message: '已在房間內' };

            const room = await this.service.getRoom(trimmedCode);
            if (!room) return { success: false, message: '房間不存在' };
            if (room.hostId === playerId) return { success: false, message: '房主不能加入' };
            if (room.status !== 'waiting') return { success: false, message: '遊戲已開始' };

            const updatedRoom = await this.service.addPlayer(trimmedCode, playerId, name, avatar);
            if (!updatedRoom) return { success: false, message: '加入失敗' };

            return { success: true, room: updatedRoom };
        } catch (error: any) {
            return { success: false, message: '伺服器錯誤' };
        }
    }

    private async _startGameLogic(roomCode: string, hostId: string) {
        const room = await this.service.getRoom(roomCode);
        if (!room) return { success: false, message: '房間不存在' };
        if (room.hostId !== hostId) return { success: false, message: '權限不足' };
        if (room.players.length < 1) return { success: false, message: '人數不足' };
        
        const updatedRoom = await this.service.startGame(roomCode);
        return { success: true, room: updatedRoom };
    }

    public submitVote = async (socket: Socket, io: Server, data: { optionId: string }) => {
        try {
            if (!data || !data.optionId) {
                SocketHelper.sendError(socket, "vote:error", "無效選項");
                return;
            }
            const room = await this.service.findRoomBySocketId(socket.id);
            if (!room) {
                SocketHelper.sendError(socket, "vote:error", "不在房間內");
                return;
            }
            if (room.hostId === socket.id) {
                SocketHelper.sendError(socket, "vote:error", "房主不可投票");
                return;
            }

            const updatedRoom = await this.service.submitVote(room.code.toString(), socket.id, data.optionId);
            
            if (updatedRoom) {
                SocketHelper.send(socket, "vote:success", { optionId: data.optionId }, "投票成功");
                
                const totalVoters = updatedRoom.players.length;
                const currentVoteCount = updatedRoom.currentVotes ? updatedRoom.currentVotes.size : 0;

                if (currentVoteCount >= totalVoters) {
                    await this._calculateAndBroadcastResult(updatedRoom, io);
                }
            }
        } catch (error: any) {
            SocketHelper.sendError(socket, "vote:error", "投票失敗");
        }
    }

    public endVoting = async (socket: Socket, io: Server) => {
        try {
            const room = await this.service.findRoomBySocketId(socket.id);
            if (!room) return;

            if (room.hostId !== socket.id) {
                SocketHelper.sendError(socket, "vote:error", "只有房主可以強制結算投票");
                return;
            }

            await this._calculateAndBroadcastResult(room, io);

        } catch (error: any) {
            logger.error(`[Controller] endVoting error:`, error);
            SocketHelper.sendError(socket, "vote:error", "結算投票失敗");
        }
    }

    private _calculateAndBroadcastResult = async (room: Room, io: Server) => {
        const votes = room.currentVotes; // Map<playerId, optionId>
        const voteCounts: Record<string, number> = {};

        if (votes && votes.size > 0) {
            for (const optionId of votes.values()) {
                voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
            }
        }

        let winningOptionId: string | null = null;
        let maxVotes = -1;

        const optionIds = Object.keys(voteCounts);
        if (optionIds.length > 0) {
            for (const optId of optionIds) {
                if (voteCounts[optId] > maxVotes) {
                    maxVotes = voteCounts[optId];
                    winningOptionId = optId;
                } else if (voteCounts[optId] === maxVotes) {
                    if (Math.random() > 0.5) {
                        winningOptionId = optId;
                    }
                }
            }
        } else {
            // 無人投票 隨機選
            if (room.currentScenarioId) {
                const currentScenario = await this.scenarioService.getNextScenarioById(room.currentScenarioId);
                if (currentScenario && currentScenario.options.length > 0) {
                        const randomIdx = Math.floor(Math.random() * currentScenario.options.length);
                        winningOptionId = currentScenario.options[randomIdx].optionId;
                }
            }
        }

        if (!winningOptionId) {
            logger.error(`[Vote] Could not determine winning option for room ${room.code}`);
            return;
        }

        // 查詢下一關
        if (!room.currentScenarioId) return;
        const currentScenario = await this.scenarioService.getNextScenarioById(room.currentScenarioId);
        if (!currentScenario) return;

        const selectedOption = currentScenario.options.find(opt => opt.optionId === winningOptionId);
        const nextScenarioId = selectedOption ? selectedOption.nextScenarioId : null;

        // 清除投票
        await this.service.concludeVoting(room.code.toString(), nextScenarioId);

        // 廣播結果
        SocketHelper.ioEmit(io, room.code.toString(), "vote:result", {
            winningOptionId: winningOptionId,
            voteCounts: voteCounts,
            nextScenarioId: nextScenarioId,
            consequence: selectedOption?.consequence || "無後果描述"
        });
    }

    /**
     * 重新開始遊戲 (回到 Lobby)
     * Event: "game:restart"
     */
    public restartGame = async (socket: Socket, io: Server) => {
        try {
            const room = await this.service.findRoomBySocketId(socket.id);
            if (!room) return;

            if (room.hostId !== socket.id) {
                SocketHelper.sendError(socket, "room:error", "只有房主可以重新開始遊戲");
                return;
            }

            const updatedRoom = await this.service.resetRoom(room.code.toString());
            
            if (updatedRoom) {
                SocketHelper.ioEmit(io, room.code.toString(), "game:restarted", {
                    room: updatedRoom
                }, "遊戲已重新開始，回到大廳");
                
                logger.info(`[Controller] Room ${room.code} restarted by host, returning to lobby`);
            }
        } catch (error: any) {
            SocketHelper.sendError(socket, "room:error", "重置遊戲失敗");
            logger.error(`[Controller] restartGame error:`, error);
        }
    }
}