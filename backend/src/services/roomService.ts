import { Room } from "../interfaces/room";
import * as RoomRepository from "../repository/roomRepository";

export class roomService {
    
    public async getRoom(roomCode: string): Promise<Room | null> {
        return await RoomRepository.getRoom(Number(roomCode));
    }

    public async createRoom(hostId: string): Promise<Room> {
        return await RoomRepository.createRoom(hostId);
    }

    public async deleteRoom(roomCode: string): Promise<boolean> {
        return await RoomRepository.deleteRoom(Number(roomCode));
    }

    public async isSocketInRoom(socketId: string): Promise<boolean> {
        const room = await RoomRepository.findRoomBySocketId(socketId);
        return !!room;
    }

    public async findRoomBySocketId(socketId: string): Promise<Room | null> {
        return await RoomRepository.findRoomBySocketId(socketId);
    }

    public async addPlayer(roomCode: string, playerId: string): Promise<Room | null> {
        return await RoomRepository.addPlayer(Number(roomCode), playerId);
    }
    
    public async removePlayer(roomCode: string, playerId: string): Promise<Room | null> {
        return await RoomRepository.removePlayer(Number(roomCode), playerId);
    }

    public async startGame(roomCode: string): Promise<Room | null> {
        return await RoomRepository.startGame(Number(roomCode));
    }
}