import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Consultation, ChatMessage } from '../../types';
import { 
  subscribeChatMessages, 
  sendChatMessage 
} from '../../services/consultationService';
import { 
  ArrowLeft, 
  Send, 
  Sprout, 
  MapPin, 
  User, 
  Clock, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface ChatRoomProps {
  consultation: Consultation;
  onBack: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ consultation, onBack }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFarmer = profile?.role === 'farmer';
  const otherName = isFarmer ? consultation.expertName : consultation.farmerName;
  const otherRoleTitle = isFarmer ? 'Agricultural Expert' : 'Farmer';

  // Quick suggestions based on role
  const quickSuggestions = isFarmer
    ? [
        'Leaves are turning yellow',
        'Small insects under leaves',
        'What dosage should I spray?',
        'Can you suggest organic treatment?',
      ]
    : [
        'Please check for moisture at root level',
        'Apply Neem oil spray (5ml per liter)',
        'Avoid chemical spray in full sunlight',
        'Ensure proper furrow irrigation',
      ];

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!consultation.id) return;
    const unsub = subscribeChatMessages(consultation.id, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [consultation.id]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !profile) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await sendChatMessage(
        consultation.id,
        profile.id,
        profile.name || (isFarmer ? 'Farmer' : 'Expert'),
        profile.role,
        textToSend
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickSend = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-5.5rem)] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-emerald-800 text-white p-3.5 sm:p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
            title="Back to consultations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-700 border border-emerald-500 flex items-center justify-center text-lg font-bold">
              {isFarmer ? '🔬' : '🌾'}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  {otherName}
                </h3>
                {isFarmer && <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />}
              </div>
              <p className="text-[11px] text-emerald-200 flex items-center space-x-1">
                <span>{otherRoleTitle}</span>
                {!isFarmer && consultation.farmerLocation && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{consultation.farmerLocation}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Consultation badges */}
        <div className="text-right">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-700 text-emerald-100 border border-emerald-600">
            {consultation.cropName} • {consultation.category}
          </span>
          <p className="text-[10px] text-emerald-300 mt-0.5">
            Real-Time Firestore Chat
          </p>
        </div>
      </div>

      {/* Context Banner: The original question */}
      <div className="bg-emerald-50/90 border-b border-emerald-200 px-4 py-2 text-xs flex items-start space-x-2">
        <Sprout className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-gray-700">
          <span className="font-semibold text-emerald-950">Reported Problem: </span>
          <span className="text-gray-800 line-clamp-2">{consultation.description}</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50/50 to-white">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <Sprout className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Consultation Session Active</p>
            <p className="text-xs text-gray-500 max-w-xs mt-1">
              {isFarmer
                ? `You can now chat with ${consultation.expertName} in real time for expert guidance.`
                : `You are connected with ${consultation.farmerName}. Provide your diagnosis and recommendations.`}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === profile?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">
                  {isMe ? 'You' : `${msg.senderName} (${msg.senderRole})`}
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="text-[10px] text-gray-400 font-semibold uppercase flex-shrink-0">
          Quick Suggestions:
        </span>
        {quickSuggestions.map((text, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickSend(text)}
            className="text-[11px] whitespace-nowrap bg-white text-emerald-800 border border-emerald-200 hover:border-emerald-400 rounded-full px-2.5 py-0.5 shadow-2xs transition flex-shrink-0"
          >
            {text}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${otherName}...`}
          className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition disabled:opacity-40 disabled:hover:bg-emerald-600 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
