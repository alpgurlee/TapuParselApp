import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface Notification {
  id: string;
  message: string;
  type: AlertColor;
  date: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: AlertColor) => void;
  markAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // Local storage'dan bildirimleri yükle
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  useEffect(() => {
    // Bildirimleri local storage'a kaydet
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message: string, type: AlertColor) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      date: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setCurrentNotification(newNotification);
    setOpenSnackbar(true);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearNotification,
        clearAll,
        unreadCount,
      }}
    >
      {children}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {currentNotification && (
          <Alert
            onClose={handleCloseSnackbar}
            severity={currentNotification.type}
            variant="filled"
          >
            {currentNotification.message}
          </Alert>
        )}
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
