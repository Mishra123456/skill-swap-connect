require('dotenv').config();

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await connectDB();

        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
            }
        });

        // Attach io instance to express app
        app.set('io', io);

        io.on('connection', (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                console.log(`Socket ${socket.id} joined room ${roomId}`);
            });

            // Handle voice/video call signaling
            socket.on('call-user', ({ roomId, offer, type }) => {
                console.log(`Call initiated in room ${roomId} of type ${type}`);
                socket.to(roomId).emit('call-made', { offer, socketId: socket.id, type });
            });

            socket.on('make-answer', ({ roomId, answer }) => {
                console.log(`Answer made in room ${roomId}`);
                socket.to(roomId).emit('answer-made', { answer, socketId: socket.id });
            });

            socket.on('ice-candidate', ({ roomId, candidate }) => {
                socket.to(roomId).emit('ice-candidate-received', { candidate, socketId: socket.id });
            });

            socket.on('reject-call', ({ roomId }) => {
                console.log(`Call rejected in room ${roomId}`);
                socket.to(roomId).emit('call-rejected');
            });

            socket.on('end-call', ({ roomId }) => {
                console.log(`Call ended in room ${roomId}`);
                socket.to(roomId).emit('call-ended');
            });

            socket.on('leave-room', (roomId) => {
                socket.leave(roomId);
                socket.to(roomId).emit('user-left', { socketId: socket.id });
                console.log(`Socket ${socket.id} left room ${roomId}`);
            });

            socket.on('disconnect', () => {
                console.log(`Socket disconnected: ${socket.id}`);
            });
        });

        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT} (0.0.0.0) with Socket.io signaling`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

