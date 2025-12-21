import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useTeams } from '../../../context/TeamContext';
import { chatService } from '../services/chatService';

const ChatWindow = ({ channelId }) => {
  const { socket } = useSocket();
  const { activeTeam } = useTeams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  // 1. Fetch History & Join Room
  useEffect(() => {
    if (!activeTeam?._id || !channelId || !socket) return;

    const loadChat = async () => {
      try {
        const data = await chatService.getMessages(activeTeam._id, channelId);
        setMessages(data.messages);
        
        // Tell server we are joining this specific channel room
        socket.emit('channel:join', { teamId: activeTeam._id, channelId });
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    loadChat();

    // 2. Listen for real-time messages
    socket.on('message:new', (newMessage) => {
      // Only add if it belongs to this channel
      if (newMessage.channelId === channelId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      socket.off('message:new');
      socket.emit('channel:leave', { channelId });
    };
  }, [activeTeam?._id, channelId, socket]);

  // 3. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.emit('message:send', {
      teamId: activeTeam._id,
      channelId,
      text
    });
    setText('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg._id} className={`flex flex-col ${msg.system ? 'items-center' : 'items-start'}`}>
            {!msg.system && (
              <span className="text-xs font-bold text-gray-600 mb-1">
                {msg.senderId?.name || 'Unknown'}
              </span>
            )}
            <div className={`px-4 py-2 rounded-lg max-w-md ${
              msg.system ? 'bg-gray-100 text-gray-500 text-xs italic' : 'bg-blue-100 text-gray-800'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message #general"
          className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;