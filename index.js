require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Хранилище сообщений (в реальном приложении используйте базу данных)
const messages = [];

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  // Отправляем историю сообщений новому пользователю
  socket.emit('message_history', messages);

  // Обработка нового сообщения
  socket.on('send_message', (message) => {
    messages.push(message);
    io.emit('new_message', message); // Рассылаем всем
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
