import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './SocketContext';
import type { Room } from '../interfaces/Room';
import type { Scenario } from '../interfaces/Scenario';
import type { VoteResult } from '../interfaces/Vote';

interface IGameContext {
  room: Room | null;
  currentScenario: Scenario | null;
  voteResult: VoteResult | null;
  isHost: boolean;
  createRoom: () => void;
  leaveRoom: () => void;
  startGame: () => void;
  submitVote: (optionId: string) => void; // 預留給玩家端
  endVoting: () => void; // 房主觸發結算
  fetchNextScenario: (nextId: string) => void;
}

const GameContext = createContext<IGameContext>({} as IGameContext);

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);

  const isHost = socket && room ? socket.id === room.hostId : false;

  useEffect(() => {
    if (!socket) return;

    socket.on('room:created', (response) => {
      if (response.success) {
        setRoom(response.body);
        navigate(`/lobby/${response.body.code}`);
      }
    });

    socket.on('player:joined', (response) => {
       if (response.success) {
         setRoom((prev) => prev ? { ...prev, players: response.body.players } : prev);
       }
    });

    socket.on('player:left', (response) => {
        if (response.success) {
            setRoom((prev) => prev ? { ...prev, players: response.body.players } : prev);
        }
    });

    socket.on('game:started', (response) => {
        if (response.body.room) {
            setRoom(response.body.room);
            navigate(`/game/${response.body.room.code}`);
        }
    });

    // 遊戲開始或進入下一關時收到
    const handleScenarioUpdate = (response: any) => {
        if (response.success) {
            setCurrentScenario(response.body);
            setVoteResult(null); // 清除上一輪的投票結果
        }
    };

    socket.on('scenario:first', handleScenarioUpdate);
    socket.on('scenario:next', handleScenarioUpdate);

    socket.on('vote:result', (response) => {
        if (response.success) {
            setVoteResult(response.body);
        }
    });

    socket.on('room:closed', () => {
        alert('房間已關閉');
        setRoom(null);
        setCurrentScenario(null);
        navigate('/');
    });

    return () => {
      socket.off('room:created');
      socket.off('player:joined');
      socket.off('player:left');
      socket.off('game:started');
      socket.off('room:closed');
      socket.off('scenario:first');
      socket.off('scenario:next');
      socket.off('vote:result');
    };
  }, [socket, navigate]);

  const createRoom = () => socket?.emit('room:create');
  
  const leaveRoom = () => {
    if (socket) {
        socket.emit('room:leave');
        setRoom(null);
        setCurrentScenario(null);
        navigate('/');
    }
  };

  const startGame = () => socket?.emit('game:start');

  const submitVote = (optionId: string) => {
      socket?.emit('vote:submit', { optionId });
  };

  const endVoting = () => {
      if (isHost) socket?.emit('vote:end');
  };

  const fetchNextScenario = (nextScenarioId: string) => {
      if (isHost) socket?.emit('scenario:next', { nextScenarioId });
  };

  return (
    <GameContext.Provider value={{ 
        room, 
        currentScenario, 
        voteResult, 
        isHost, 
        createRoom, 
        leaveRoom, 
        startGame,
        submitVote,
        endVoting,
        fetchNextScenario
    }}>
      {children}
    </GameContext.Provider>
  );
};