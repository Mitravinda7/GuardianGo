export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join_city', (city) => {
      socket.join(city.toLowerCase());
      console.log(`📍 Client joined room: ${city}`);
    });

    socket.on('leave_city', (city) => {
      socket.leave(city.toLowerCase());
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return {
    emitNewReport: (city, report) => {
      io.to(city.toLowerCase()).emit('new_report', report);
    },
    emitNewAlert: (city, alert) => {
      io.to(city.toLowerCase()).emit('new_alert', alert);
    },
    emitSOS: (userId, sosEvent) => {
      io.emit('sos_triggered', { userId, sosEvent });
    },
  };
};