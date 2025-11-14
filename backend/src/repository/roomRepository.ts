import { logger } from "../middlewares/log";
import { Room } from "../interfaces/room";
import { RoomModel } from "../models/roomSchema";

async function generateRoomCode(): Promise<number> {
    let code: number;
    let existingRoom: boolean;

    do {
        // 隨機 6 位數字
        code = Math.floor(100000 + Math.random() * 900000);

        const room = await RoomModel.findOne({ "code": code });
        existingRoom = !!room;

    } while (existingRoom);
    return code;
}

export async function getRoom(roomCode: number): Promise<Room | null> {
    return RoomModel.findOne({ "code": roomCode }).exec();
}

export async function createRoom(hostId: string): Promise<Room> {
    const roomCode = await generateRoomCode();
    const newRoom = new RoomModel({
        code: roomCode,
        hostId: hostId,
        players: [],
        gameStarted: false
    })

    await newRoom.save();

    logger.info(`[Room] created with code: ${roomCode} by host: ${hostId}`);
    return newRoom.toObject();
}

export async function deleteRoom(roomCode: number): Promise<boolean> {
    const result = await RoomModel.deleteOne({ "code": roomCode });

    if (result.deletedCount && result.deletedCount > 0) {
        logger.info(`[Room] ${roomCode} deleted`);
        return true;
    }
    
    return false;
}

export async function findRoomBySocketId(socketId: string): Promise<Room | null> {
    return RoomModel.findOne({
        $or: [
            { hostId: socketId },
            { players: socketId }
        ]
    }).exec();
}

export async function addPlayer(roomCode: number, playerId: string): Promise<Room | null> {
    return RoomModel.findOneAndUpdate(
        { code: roomCode },
        { $push: { players: playerId } },
        { new: true }
    ).exec();
}

export async function removePlayer(roomCode: number, playerId: string): Promise<Room | null> {
    return RoomModel.findOneAndUpdate(
        { code: roomCode },
        { $pull: { players: playerId } },
        { new: true }
    ).exec();
}

export async function startGame(roomCode: number): Promise<Room | null> {
    return RoomModel.findOneAndUpdate(
        { code: roomCode },
        { gameStarted: true },
        { new: true }
    ).exec();
}