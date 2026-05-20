import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, Phone, Video } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
}

export function ChatAdmin() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Selamat datang di SEWAMOBILYUK. Ada yang bisa kami bantu?',
      sender: 'admin',
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login', { state: { returnTo: '/chat-admin' } });
    }
  }, [navigate]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    setTimeout(() => {
      const adminReply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Terima kasih atas pesan Anda. Admin kami akan segera membalas.',
        sender: 'admin',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, adminReply]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <div className="bg-primary text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">CS</span>
              </div>
              <div>
                <h1 className="font-semibold">Customer Service</h1>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg">
              <Phone size={20} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg">
              <Video size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-card text-foreground rounded-tl-sm shadow-sm'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                }`}
              >
                {msg.timestamp.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border-t border-border px-6 py-4">
        <div className="flex gap-3 items-end">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan Anda..."
            rows={1}
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-primary text-white p-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
