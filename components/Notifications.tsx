import React from 'react';
import { InfoIcon, WarningIcon, ErrorIcon, SuccessIcon } from './icons.js';

const NotificationItem = ({ notification }) => {
  const { message, type, timestamp } = notification;

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <InfoIcon className="w-5 h-5 text-blue-400" />;
      case 'warning':
        return <WarningIcon className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <ErrorIcon className="w-5 h-5 text-red-400" />;
      case 'success':
        return <SuccessIcon className="w-5 h-5 text-green-400" />;
      default:
        return <InfoIcon className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const timeSince = (dateString) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex items-start space-x-3 p-3 border-b border-gray-700/50">
      <div className="flex-shrink-0 pt-1">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-200">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{timeSince(timestamp)}</p>
      </div>
    </div>
  );
};

const Notifications = ({ notifications, onClear }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 h-full flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        {notifications.length > 0 && 
            <button onClick={onClear} className="text-sm text-blue-400 hover:text-blue-300">Clear All</button>
        }
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notif => <NotificationItem key={notif.id} notification={notif} />)
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;