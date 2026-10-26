import React, { useState, useRef, useEffect } from 'react';
import { Flame, Send, ShieldCheck, Lock, Edit3, Trash2, ArrowLeft, Check, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DiscreetJournal() {
  const [isDemoChatMode, setIsDemoChatMode] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      name: 'Sister Brenda',
      text: 'Demo Mode: This interactive chat simulates confidential counseling assistance. No one is reading this in real-time yet. In an actual emergency, dial 10111 or use the official assistance channel.',
      time: 'Just now',
    },
  ]);

  // Innocent default notepad text
  const [notepadContent, setNotepadContent] = useState(
    `Shopping & Weekly Errands:\n1. Low fat milk & whole grain bread\n2. Free-range eggs & butter\n3. Fresh spinach & tomatoes\n4. Household cleaning spray\n5. Collect pharmacy refill on Wednesday`
  );

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // BURN ACTION: Clears this demo conversation from the current view
  const handleBurnEverything = () => {
    setMessages([]);
    setIsDemoChatMode(false);
    setNotepadContent(
      `Weekly Grocery & Supply List:\n1. Milk, eggs, wholewheat bread\n2. Rooibos tea & brown sugar\n3. Detergent & hand soap\n4. Call dentist to confirm 14:00 slot`
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      name: 'You',
      text: userText,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Simulate comforting professional crisis assistant response
    setTimeout(() => {
      let replyText =
        'Thank you for reaching out. We are here with you. If someone enters the room, remember to press the Burn icon at the top right to erase our chat immediately.';
      if (userText.toLowerCase().includes('help') || userText.toLowerCase().includes('scared') || userText.toLowerCase().includes('hurt')) {
        replyText =
          'This is a demo chat. No counsellor or support service is connected yet.';
      } else if (userText.toLowerCase().includes('safe')) {
        replyText =
          'Good. We will keep this channel open for you. If you need transport or safe shelter, let us know your closest landmark.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          name: 'Sister Brenda',
          text: replyText,
          time: 'Just now',
        },
      ]);
    }, 1100);
  };

  return (
    <div className="flex-1 flex flex-col space-y-3 font-sans text-slate-800">
      <div className="text-xs text-slate-500 mb-2">Demo chat: no one is reading this yet.</div>
      {/* Discreet Header with innocent title & Burn Icon */}
      <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-xs">
              {isDemoChatMode ? 'Demo Diary Entry' : 'Personal Notepad & Memos'}
            </h2>
            <p className="text-[10px] text-slate-400">Offline scratchpad & auto-save</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Toggle between Innocent Notepad and Counselor Chat */}
          <button
            onClick={() => setIsDemoChatMode(!isDemoChatMode)}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
          >
            {isDemoChatMode ? 'View Standard Note' : 'Demo Chat'}
          </button>

          {/* Clear button */}
          <button
            onClick={handleBurnEverything}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-[11px] font-semibold transition cursor-pointer"
            title="Clear this demo view"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Burn</span>
          </button>
        </div>
      </div>

      {/* Main Container: Innocent Notepad or Demo Chat */}
      {!isDemoChatMode ? (
        /* Harmless Apple Notes Style Scratchpad */
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="text-[10px] text-slate-400 font-mono">Last edited today at 11:42</span>
            <span className="text-[10px] text-slate-400">5 items</span>
          </div>

          <textarea
            value={notepadContent}
            onChange={(e) => setNotepadContent(e.target.value)}
            className="flex-1 w-full resize-none border-0 focus:outline-none text-xs text-slate-700 leading-relaxed font-sans placeholder-slate-400 bg-transparent"
            placeholder="Type your notes here..."
          />
        </div>
      ) : (
        /* Demo Chat Interface */
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
          {/* Chat Messages */}
          <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1 pb-2">
            <div className="text-center my-1">
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-mono font-medium block">
                DEMO MODE &bull; Not monitored live &bull; For real emergencies dial 10111
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5 px-1">{msg.name}</span>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Write a note..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
