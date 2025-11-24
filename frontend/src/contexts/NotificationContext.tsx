import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import './styles/Notification.css';

type NotificationType = 'success' | 'error' | 'warning';

interface Notification {
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);

    setNotification({ message, type });
    setIsVisible(true);

    closeTimerRef.current = setTimeout(() => {
      setIsVisible(false);

      cleanupTimerRef.current = setTimeout(() => {
        setNotification(null);
      }, 500);
    }, 3000);
  }, []);

  const showSuccess = useCallback((msg: string) => showNotification(msg, 'success'), [showNotification]);
  const showError = useCallback((msg: string) => showNotification(msg, 'error'), [showNotification]);
  const showWarning = useCallback((msg: string) => showNotification(msg, 'warning'), [showNotification]);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showWarning }}>
      {children}
      
      {notification && (
        <div className={`notification-wrapper ${isVisible ? 'slide-in' : 'slide-out'}`}>
          <div className={`notification-content ${notification.type}`}>
            {notification.message}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};