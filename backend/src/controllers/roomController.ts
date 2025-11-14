import { Socket, Server } from "socket.io";
import { roomService } from "../services/roomService";
import { logger } from "../middlewares/log";

const service = new roomService();

export async function createRoom(socket: Socket) {
    try {
        const isInRoom = await service.isSocketInRoom(socket.id);
        if (isInRoom) {
            socket.emit("room:error", { message: "你已經在一個房間了，不能重複建立" });
            return;
        }

        const newRoom = await service.createRoom(socket.id);
        socket.join(newRoom.code.toString());
        socket.emit("room:created", { 
            code: newRoom.code, 
            hostId: newRoom.hostId,
            players: newRoom.players
        });
        logger.info(`[Controller] Room ${newRoom.code} Created by ${socket.id}`);
    } catch (error: any) {
        socket.emit("room:error", { message: "無法建立房間" });
        logger.error(`[Controller] createRoom error: `, error);
    }
}

export async function joinRoom(socket: Socket, roomCode: string) {
    try {
        const isInRoom = await service.isSocketInRoom(socket.id);
        if (isInRoom) {
            socket.emit("room:error", { message: "你已經在一個房間了，不能加入" });
            return;
        }

        const room = await service.getRoom(roomCode);
        if (!room) {
            socket.emit("room:error", { message: "房間不存在" });
            return;
        }

        if (room.hostId === socket.id) {
             socket.emit("room:error", { message: "你不能加入自己建立的房間" });
            return;
        }
        
        if (room.gameStarted) {
            socket.emit("room:error", { message: "遊戲已經開始，無法加入" });
            return;
        }

        // 將玩家加入資料庫
        const updatedRoom = await service.addPlayer(roomCode, socket.id);
        if (!updatedRoom) {
            throw new Error("加入玩家時更新房間失敗");
        }

        socket.join(room.code.toString());

        // 回傳給自己 成功加入
        socket.emit("room:joined", updatedRoom);

        // 回傳給其他人 有新玩家
        socket.to(room.code.toString()).emit("player:joined", { 
            playerId: socket.id,
            players: updatedRoom.players
        });

    } catch (error: any) {
        socket.emit("room:error", { message: "無法加入房間" });
        logger.error(`[Controller] joinRoom error: `, error);
    }
}

export async function handleStartGame(io: Server, socket: Socket) {
    try {
        const room = await service.findRoomBySocketId(socket.id);
        if (!room) {
            socket.emit("room:error", { message: "你不在任何房間內" });
            return;
        }

        // 檢查是否為房主
        if (room.hostId !== socket.id) {
            socket.emit("room:error", { message: "只有房主才能開始遊戲" });
            return;
        }
        
        // 更新資料庫狀態
        await service.startGame(String(room.code));

        // 向所有人廣播遊戲已開始
        logger.info(`[Controller] Room ${room.code} started`);
        io.to(room.code.toString()).emit("game:started", {
            message: "遊戲已開始"
        });

    } catch (error: any) {
        socket.emit("room:error", { message: "無法開始遊戲" });
        logger.error(`[Controller] handleStartGame error: `, error);
    }
}

export async function handleDisconnect(io: Server, socket: Socket) {
    try {
        const room = await service.findRoomBySocketId(socket.id);
        if (!room) {
            return;
        }

        if (room.hostId === socket.id) {
            await service.deleteRoom(String(room.code));
            
            io.to(room.code.toString()).emit("room:closed", {
                message: "房主已離線，房間已解散"
            });
            logger.info(`[Controller] Room ${room.code} closed`);
        } else {
            await service.removePlayer(String(room.code), socket.id);
            
            io.to(room.code.toString()).emit("player:left", {
                playerId: socket.id
            });
        }
    } catch (error: any) {
         logger.error(`[Controller] handleDisconnect error: `, error);
    }
}