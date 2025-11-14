import { Server, Socket } from "socket.io";
import { logger } from "../middlewares/log";
import * as roomController from "../controllers/roomController";

export function registerSocketHandlers(io: Server) {
    io.on("connection", (socket: Socket) => {
        logger.info(`User Connected: ${socket.id}`);

        socket.on('room:create', () => {
            roomController.createRoom(socket);
        });

        socket.on('room:join', (data: { roomCode: string }) => {
            if (data && data.roomCode) {
                roomController.joinRoom(socket, data.roomCode);
            };
        });

        socket.on('game:start', () => {
            roomController.handleStartGame(io, socket);
        });

        socket.on('disconnect', () => {
            roomController.handleDisconnect(io, socket);
        });
    });
}