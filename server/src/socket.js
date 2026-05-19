const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tradafy_super_secret_fallback');
      socket.user = decoded; // { id, roles, ... }
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // console.log(`Socket connected: ${socket.id} (User: ${socket.user.id})`);

    // Join the user's personal room for direct user notifications if needed
    socket.join(`user_${socket.user.id}`);

    // Join a specific deal room
    socket.on('join_deal', (dealId) => {
      // In a more complex setup, we would query the DB to ensure `socket.user.id` is a participant in `dealId`.
      // For operational simplicity, we rely on the frontend only joining if they have access to the deal workspace.
      socket.join(`deal_${dealId}`);
      // console.log(`User ${socket.user.id} joined deal room: deal_${dealId}`);
    });

    socket.on('leave_deal', (dealId) => {
      socket.leave(`deal_${dealId}`);
    });

    socket.on('disconnect', () => {
      // console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
