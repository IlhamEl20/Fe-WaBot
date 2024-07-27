"use client";
import styles from "../page.module.css";
import { io } from "socket.io-client";
import { useState } from "react";
import ChatPage from "../components/chat/page";
import { notification } from "antd";

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [roomId, setRoomId] = useState("");

  let socket;
  socket = io("http://localhost:3001");

  const handleJoin = () => {
    if (userName !== "" && roomId !== "") {
      console.log(userName, "userName", roomId, "roomId");
      socket.emit("join_room", roomId);
      setShowSpinner(true);
      // You can remove this setTimeout and add your own logic
      setTimeout(() => {
        setShowChat(true);
        setShowSpinner(false);
      }, 4000);
    } else {
      notification.error({
        message: "Masuka username dan id rooam",
        description: "masih kosong",
      });
    }
  };

  return (
    <div>
      <div
        className={styles.main_div}
        style={{ display: showChat ? "none" : "" }}
      >
        <input
          className={`border rounded px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500 ${
            showSpinner ? "opacity-50 cursor-not-allowed" : ""
          }`}
          type="text"
          placeholder="Username"
          onChange={(e) => setUserName(e.target.value)}
          disabled={showSpinner}
        />
        <input
          className={`border rounded px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500 ${
            showSpinner ? "opacity-50 cursor-not-allowed" : ""
          }`}
          type="text"
          placeholder="room id"
          onChange={(e) => setRoomId(e.target.value)}
          disabled={showSpinner}
        />
        <button
          className={`bg-blue-500 w-64 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            showSpinner ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleJoin}
        >
          {!showSpinner ? (
            "Join"
          ) : (
            <div className={styles.loading_spinner}></div>
          )}
        </button>
      </div>
      <div style={{ display: !showChat ? "none" : "" }}>
        <ChatPage socket={socket} roomId={roomId} username={userName} />
      </div>
    </div>
  );
}
