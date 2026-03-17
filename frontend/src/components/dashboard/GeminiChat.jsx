import React, { useState } from 'react';
import { runChat } from '../../utils/gemini'; // Adjust path if needed

const GeminiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ text: "Hello! How can I help with your health inventory today?", sender: "bot" }]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsg = { text: input, sender: "user" };
    setMessages([...messages, newMsg]);
    setInput("");

    const response = await runChat(input);
    setMessages(prev => [...prev, { text: response, sender: "bot" }]);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ padding: '10px 20px', borderRadius: '50px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        {isOpen ? 'Close AI' : 'Ask Gemini AI'}
      </button>

      {isOpen && (
        <div style={{ width: '300px', height: '400px', backgroundColor: 'white', border: '1px solid #ccc', marginTop: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', padding: '10px', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ textAlign: m.sender === 'user' ? 'right' : 'left', margin: '5px 0' }}>
                <span style={{ backgroundColor: m.sender === 'user' ? '#007bff' : '#f1f1f1', color: m.sender === 'user' ? 'white' : 'black', padding: '5px 10px', borderRadius: '10px', fontSize: '14px' }}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} style={{ flex: 1, padding: '5px' }} placeholder="Type here..." />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiChat;