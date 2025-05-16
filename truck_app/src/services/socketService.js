import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    // Prevent multiple connections
    if (!this.socket) {
      try {
        this.socket = io(SOCKET_URL, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: Infinity
        });
        
        console.log('Attempting socket connection...');

        this.socket.on('connect', () => {
          this.isConnected = true;
          console.log('Socket.IO connected successfully');
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
          console.log('Socket.IO disconnected');
        });

        this.socket.on('connect_error', (err) => {
          console.error('Socket.IO connection error:', err);
        });
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket.IO disconnected manually');
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      console.log(`Registered listener for ${event} event`);
    } else {
      console.warn(`Cannot register for ${event}, socket not connected`);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      console.log(`Removed listener for ${event} event`);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
      console.log(`Emitted ${event} event:`, data);
    } else {
      console.warn('Cannot emit event, socket not connected');
    }
  }
}

export default new SocketService();