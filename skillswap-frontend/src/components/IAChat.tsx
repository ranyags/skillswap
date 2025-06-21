"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, MicOff, X } from "lucide-react";
import { Bot } from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function IAChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.lang = "fr-FR";
    recog.interimResults = false;
    recog.continuous = false;
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + " " + transcript);
    };
    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);
    recognitionRef.current = recog;
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: "Bonjour ! Comment puis-je vous aider aujourd’hui ?" }]);
    }
  }, [open]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const updated = [...messages, { role: "user", content: input }];
    setMessages(updated);

    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ZwaycRSC2NTM1bLiVkVLtlbiQrB9rf2p`,
        },
        body: JSON.stringify({
          model: "mistral-small",
          messages: updated,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || "❌ Réponse vide.";
      setMessages([...updated, { role: "assistant", content }]);
    } catch (error) {
      setMessages([...updated, { role: "assistant", content: "❌ Erreur IA" }]);
    }

    setInput("");
    setLoading(false);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
    setIsListening(!isListening);
  };

  return (
    <>
      {!open && (
        <motion.div className="ia-toggle-btn" whileHover={{ scale: 1.1 }}>
          <button onClick={() => setOpen(true)}>
            <Bot size={24} />
          </button>
        </motion.div>
      )}

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="iachat-container"
        >
          <div className="iachat-header">
            <div className="iachat-title">
              <Bot size={20} />
              <div>
                <div className="title">Assistant IA</div>
                <div className="status">🟢 En ligne - Réponse instantanée</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="close-btn">
              <X size={18} />
            </button>
          </div>

          <div ref={chatRef} className="messages-wrapper">
            {messages.map((msg, i) => (
              <div key={i} className={`message-bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>

          <div className="chat-footer">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Écrivez votre message..."
              className="chat-input"
            />
            <button onClick={toggleListening} className={`mic-btn ${isListening ? "listening" : ""}`}>
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          <button onClick={sendMessage} disabled={loading} className="send-btn">
            {loading ? "Génération..." : (
              <>
                <Send className="w-4 h-4" /> Envoyer
              </>
            )}
          </button>
        </motion.div>
      )}
    </>
  );
}
