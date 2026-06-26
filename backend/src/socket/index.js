const onlineUsers = new Map();

function setupSocket(io) {
  io.on('connection', (socket) => {
    const { userId, username } = socket.handshake.auth;
    if (!userId) return;

    onlineUsers.set(userId, { id: userId, username, socketId: socket.id });
    io.emit('online-users', Array.from(onlineUsers.values()));

    socket.on('send-message', (message) => {
      io.emit('chat-message', message);
    });

    socket.on('delete-message', (messageId) => {
      io.emit('chat-message-deleted', messageId);
    });

    socket.on('new-project', (project) => {
      io.emit('project-added', project);
    });

    socket.on('new-notification', (notification) => {
      io.emit('new-notification', notification);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('online-users', Array.from(onlineUsers.values()));
    });
  });
}

module.exports = setupSocket;
