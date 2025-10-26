import React, { useState } from "react";
import { sendMessageToGPT } from "../../api/chat";
import "./Chatbot.css";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const reply = await sendMessageToGPT(input);
    const botMsg = { role: "assistant", content: reply };
    setMessages((prev) => [...prev, botMsg]);
    setInput("");
  };

  return (
    <div className="chatbot-container">
      <h2>💬 GPT-4o 챗봇</h2>

      <div className="chatbox">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role === "user" ? "user" : "assistant"}`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  );
}
