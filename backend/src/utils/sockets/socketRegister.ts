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

        socket.on('room:create', () =>
            createSocketHandler(roomController.createRoom)(socket, io)
        );

        socket.on('room:join', (data) =>
            createSocketHandler((s, i) => roomController.joinRoom(s, i, data))(socket, io)
        );

        socket.on('game:start', () => {
            createSocketHandler(roomController.startGame)(socket, io);
            createSocketHandler((s, i) => scenarioController.getFirstScenario(s))(socket, io);
        });

        socket.on('scenario:first', () =>
            createSocketHandler((s, i) => scenarioController.getFirstScenario(s))(socket, io)
        );
        
        socket.on('scenario:next', (data) =>
            createSocketHandler((s, i) => scenarioController.getNextScenarioById(s, data.nextScenarioId))(socket, io)
        );
        
        socket.on('disconnect', () => {
            roomController.handleDisconnect(socket, io); 
        });

        socket.on('room:leave', () => {
            createSocketHandler(roomController.leaveRoom)(socket, io);
        });

        socket.on('vote:submit', (data) => 
            createSocketHandler((s, i) => roomController.submitVote(s, i, data))(socket, io)
        );

        socket.on('vote:end', () => 
            createSocketHandler(roomController.endVoting)(socket, io)
        );

        socket.on("game:restart", () => 
            createSocketHandler(roomController.restartGame)(socket, io)
        );

        socket.on('player:kick', (data) => 
            createSocketHandler((s, i) => roomController.kickPlayer(s, i, data))(socket, io)
        );
    });
};