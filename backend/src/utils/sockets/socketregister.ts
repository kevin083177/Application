import { Server, Socket } from 'socket.io';
import { RoomController } from '../../controllers/roomController';
import { createSocketHandler } from './socketHandler';
import { logger } from '../../middlewares/log';
import { ScenarioController } from '../../controllers/scenarioController';

export const registerSocketHandlers = (io: Server) => {
    const roomController = new RoomController(io);
    const scenarioController = new ScenarioController(io);
    io.on('connection', (socket: Socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // 綁定事件：使用 createSocketHandler 包裹 Controller 方法
        socket.on('room:create', () =>
            createSocketHandler(roomController.createRoom)(socket, io)
        );

        socket.on('room:join', (data) =>
            createSocketHandler((s, i) => roomController.joinRoom(s, i, data.roomCode))(socket, io)
        );

        socket.on('game:start', () => {
            createSocketHandler(roomController.startGame)(socket, io);
            createSocketHandler(scenarioController.getFirstScenario)(socket, io);
        });

        socket.on('scenario:first', () =>
            createSocketHandler((s, i) => scenarioController.getFirstScenario(s))(socket, io)
        );
        
        socket.on('scenario:next', (data) =>
            createSocketHandler((s, i) => scenarioController.getNextScenarioById(s, data.nextScenarioId))(socket, io)
        );
        
        socket.on('room:disconnect', () => {
            createSocketHandler(roomController.handleDisconnect)(socket, io);
        });

        socket.on('room:leave', () => {
            createSocketHandler(roomController.handleDisconnect)(socket, io);
        });
    });
};