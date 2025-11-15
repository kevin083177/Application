import { Server, Socket } from 'socket.io';
import { RoomController } from '../../controllers/roomController';
import { createSocketHandler } from './socketHandler'; // 這裡引入包裝器
import { logger } from '../../middlewares/log';

export const registerSocketHandlers = (io: Server) => {
    const roomController = new RoomController();

    io.on('connection', (socket: Socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // 綁定事件：使用 createSocketHandler 包裹 Controller 方法
        // 這樣就不用在 Controller 裡寫 try-catch 了
        
        socket.on('room:create', () => 
            createSocketHandler(roomController.createRoom)(socket, io)
        );

        socket.on('room:join', (data) => 
            createSocketHandler((s, i) => roomController.joinRoom(s, i, data.roomCode))(socket, io)
        );

        // 更多事件...
        // socket.on('game:start', () => createSocketHandler(roomController.startGame)(socket, io));

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
            // 如果有斷線處理邏輯也可以包進去
            // createSocketHandler(roomController.handleDisconnect)(socket, io);
        });
    });
};