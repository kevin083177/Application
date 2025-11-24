import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './SocketContext';
import type { Room } from '../interfaces/Room';
import type { Scenario } from '../interfaces/Scenario';
import type { VoteResult } from '../interfaces/Vote';
import { useNotification } from './NotificationContext';

interface IGameContext {
  room: Room | null;
  currentScenario: Scenario | null;
  voteResult: VoteResult | null;
  isHost: boolean;
  createRoom: () => void;
  leaveRoom: () => void;
  startGame: () => void;
  restartGame: () => void;
  submitVote: (optionId: string) => void;
  endVoting: () => void;
  fetchNextScenario: (nextId: string) => void;
}

const GameContext = createContext<IGameContext>({} as IGameContext);

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);

  const isHost = socket && room ? socket.id === room.hostId : false;

  const restartGame = () => {
      if (isHost) socket?.emit('game:restart');
  };

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

    socket.on('game:restarted', (response) => {
        if (response.success) {
            setCurrentScenario(null);
            setVoteResult(null);
            setRoom(response.body.room);
            navigate(`/lobby/${response.body.room.code}`);
        }
    });

    const handleScenarioUpdate = (response: any) => {
        if (response.success) {
            setCurrentScenario(response.body);
            setVoteResult(null);
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
        setRoom(null);
        setCurrentScenario(null);
        setVoteResult(null);
        navigate('/');
    });
    
    socket.on('room:error', (response) => {
        showError(response.message);
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
      socket.off('game:restarted');
      socket.off('room:error');
    };
  }, [socket, navigate, showSuccess, showError]);

  const createRoom = () => socket?.emit('room:create');
  
  const leaveRoom = () => {
    if (socket) {
        socket.emit('room:leave');
        
        setRoom(null);
        setCurrentScenario(null);
        setVoteResult(null);
        
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
        restartGame,
        submitVote,
        endVoting,
        fetchNextScenario
    }}>
      {children}
    </GameContext.Provider>
  );
};