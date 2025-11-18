import { Socket, Server } from "socket.io";
import { SocketHelper } from "./socketResponse";
import { logger } from "../../middlewares/log";

type SocketHandlerFunction = (socket: Socket, io: Server, data?: any) => Promise<void>;

// 自動幫 Controller 加上 try-catch
export const createSocketHandler = (handler: SocketHandlerFunction) => {
    return async (socket: Socket, io: Server, data?: any) => {
        try {
            await handler(socket, io, data);
        } catch (error: any) {
            logger.error(`[Socket Exception] ${error.message}`);
            SocketHelper.sendError(socket, 'exception', error.message || "Internal Server Error");
        }
    };
};