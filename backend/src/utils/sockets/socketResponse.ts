import { Socket, Server } from "socket.io";
import { logger } from "../../middlewares/log";
import { SocketResp } from "../../interfaces/socketResp";

export class SocketHelper {
    /**
     * 發送錯誤訊息
     */
    static sendError(socket: Socket, event: string, message: string) {
        logger.error(`[Socket Error] ${event}: ${message}`);
        socket.emit(event, { 
            success: false, 
            message 
        });
    }

    /**
     * 發送成功回應 (只發給自己)
     */
    static send<T>(socket: Socket, event: string, body: T, message: string = "Success") {
        const payload: SocketResp<T> = {
            success: true,
            body,
            message
        };
        socket.emit(event, payload);
    }

    /**
     * 廣播給房間內其他人 (不包括自己)
     */
    static broadcast<T>(socket: Socket, room: string, event: string, body: T, message: string = "Success") {
        const payload: SocketResp<T> = {
            success: true,
            body,
            message
        };
        socket.to(room).emit(event, payload);
    }

    /**
     * 廣播給房間內所有人 (包括自己)
     * @param {Server} io - Socket.IO Server 實例
     * @param {string} room - 房間名稱
     * @param {string} event - 事件名稱
     * @param {T | null} data - 要傳送的資料 (可為 null)
     * @param {string} message - 訊息內容
     */
    static ioEmit<T>(io: Server, room: string, event: string, data: T | null, message: string = "Success") {
        const payload: SocketResp<T> = {
            success: true,
            message,
            body: data as T
        };
        io.to(room).emit(event, payload);
        logger.info(`[Socket Broadcast] ${event} to room ${room}: ${message}`);
    }
}