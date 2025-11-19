import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './SocketContext';
import type { Room } from '../interfaces/Room';

interface IGameContext {
  room: Room | null;
  isHost: boolean;
  createRoom: () => void;
  leaveRoom: () => void;
  startGame: () => void;
}

const GameContext = createContext<IGameContext>({} as IGameContext);

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);

  const isHost = socket && room ? socket.id === room.hostId : false;

  useEffect(() => {
    if (!socket) return;

    // 房間建立成功
    socket.on('room:created', (response) => {
      if (response.success) {
        setRoom(response.body);
        navigate(`/lobby/${response.body.code}`);
      } else {
        alert(response.message);
      }
    });

    // 玩家加入
    socket.on('player:joined', (response) => {
       if (response.success) {
         setRoom((prev) => {
            if (prev) {
                return { ...prev, players: response.body.players };
            }
            return prev;
         });
       }
    });

    // 玩家離開
    socket.on('player:left', (response) => {
        if (response.success) {
            setRoom((prev) => {
               if (prev) {
                   return { ...prev, players: response.body.players };
               }
               return prev;
            });
        }
    });

    // 遊戲開始
    socket.on('game:started', (response) => {
        if (response.body.room) {
            setRoom(response.body.room);
            navigate(`/game/${response.body.room.code}`);
        }
    });

    // 房間被關閉
    socket.on('room:closed', () => {
        setRoom(null);
        navigate('/');
    });

    return () => {
      socket.off('room:created');
      socket.off('player:joined');
      socket.off('player:left');
      socket.off('game:started');
      socket.off('room:closed');
    };
  }, [socket, navigate]);

  const createRoom = () => {
    if (socket) socket.emit('room:create');
  };

  const leaveRoom = () => {
    if (socket) {
        socket.emit('room:leave');
        setRoom(null);
        navigate('/');
    }
  };

  const startGame = () => {
      if(socket) socket.emit('game:start');
  }

  return (
    <GameContext.Provider value={{ room, isHost, createRoom, leaveRoom, startGame }}>
      {children}
    </GameContext.Provider>
  );
};