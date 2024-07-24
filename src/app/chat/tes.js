// pages/chat.js
"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001"); // Adjust the URL if your server is running on a different host/port

export default function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [usersTyping, setUsersTyping] = useState([]);

  useEffect(() => {
    socket.on("new message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("user joined", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { username: "System", message: `${data.username} joined` },
      ]);
    });

    socket.on("user left", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { username: "System", message: `${data.username} left` },
      ]);
    });

    socket.on("typing", (data) => {
      setUsersTyping((prevUsersTyping) => [...prevUsersTyping, data.username]);
    });

    socket.on("stop typing", (data) => {
      setUsersTyping((prevUsersTyping) =>
        prevUsersTyping.filter((user) => user !== data.username)
      );
    });

    return () => {
      socket.off("new message");
      socket.off("user joined");
      socket.off("user left");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  const handleAddUser = () => {
    if (username) {
      socket.emit("add user", username);
    }
  };

  const handleSendMessage = () => {
    if (message) {
      socket.emit("new message", message);
      setMessages((prevMessages) => [...prevMessages, { username, message }]);
      setMessage("");
      setTyping(false);
      socket.emit("stop typing");
    }
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      socket.emit("typing");
    }
  };

  const handleStopTyping = () => {
    if (typing) {
      setTyping(false);
      socket.emit("stop typing");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 text-black">
            <strong>{msg.username}: </strong> {msg.message}
          </div>
        ))}
        {usersTyping.map((user, index) => (
          <div key={index} className="mb-2 italic">
            <em>{user} is typing...</em>
          </div>
        ))}
      </div>
      <div className="flex p-4 bg-white">
        <input
          type="text"
          className="flex-1 mr-2 p-2 border border-gray-300 rounded text-black"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
        />
        <input
          type="text"
          className="flex-1 mr-2 p-2 border border-gray-300 rounded text-black"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
          onBlur={handleStopTyping}
        />
        <button
          onClick={handleSendMessage}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
