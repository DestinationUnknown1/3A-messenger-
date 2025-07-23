import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // В продакшене замените на ваш URL

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Получаем историю сообщений при подключении
    socket.on('message_history', (history) => {
      setMessages(history);
    });

    // Обработка новых сообщений
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('message_history');
      socket.off('new_message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !username.trim()) return;

    const message = {
      username,
      text: messageInput,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', message);
    setMessageInput('');
  };

  return (
    <div className="app">
      <div className="chat-container">
        <h1>Messenger</h1>
        
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.username}: </strong>
              <span>{msg.text}</span>
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="message-form">
          <input
            type="text"
            placeholder="Ваше имя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Введите сообщение..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            required
          />
          <button type="submit">Отправить</button>
        </form>
      </div>
    </div>
  );
}

export default App;
