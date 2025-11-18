import { BaseConnection } from "mongoose";
import { SocketHelper } from "../utils/sockets/socketResponse";
import { Scenario } from "../interfaces/scenario";
import { ScenarioService } from "../services/scenarioService";
import { Server, Socket } from "socket.io";
import { RoomService } from "../services/roomService";

export class ScenarioController {
    protected service: ScenarioService;
    protected roomService: RoomService;
    private io: Server;

    constructor(io: Server) {
        this.service = new ScenarioService();
        this.roomService = new RoomService();
        this.io = io;
    }

    private _validateSocketInRoom = async (socket: Socket): Promise<string | null> => {
        const room = await this.roomService.findRoomBySocketId(socket.id);
        if (!room) {
            SocketHelper.sendError(socket, "scenario:error", "你不在任何房間內，無法取得場景");
            return null;
        }
        return room.code.toString();
    };

    /**
     * 取得第一關場景
     * Event: "scenario:first"
     */
    public async getFirstScenario(socket: Socket): Promise<void> {
        const roomCode = await this._validateSocketInRoom(socket);
        if (!roomCode) return;

        const scenario = await this.service.getFirstScenario();
        if (!scenario) {
            SocketHelper.sendError(socket, "scenario:error", "無法取得第一關場景");
            return;
        }

        if (!this.io){
            SocketHelper.sendError(socket, "scenario:error", "Socket IO 未初始化");
            return;
        }
        
        SocketHelper.ioEmit(this.io, roomCode, "scenario:first", scenario, "successfully retrieved first scenario");
    }

    public async getNextScenarioById(socket: Socket, nextScenarioId: string): Promise<void> {
        const roomCode = await this._validateSocketInRoom(socket);
        if (!roomCode) return;

        const scenario = await this.service.getNextScenarioById(nextScenarioId);
        if (!scenario) {
            SocketHelper.sendError(socket, "scenario:error", "無法取得下一關場景");
            return;
        }
        
        if (!this.io){
            SocketHelper.sendError(socket, "scenario:error", "Socket IO 未初始化");
            return;
        }

        SocketHelper.ioEmit(this.io, roomCode, "scenario:next", scenario, "successfully retrieved next scenario");
    }
}