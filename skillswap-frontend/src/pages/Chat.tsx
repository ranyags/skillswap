import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import axios from "axios";
import "../styles/Chat.scss";

const Chat = () => {
  const { receiverId } = useParams();
  const [messages, setMessages] = useState<{ sender: string; text: string; time?: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverName, setReceiverName] = useState("Utilisateur");
  const [receiverAvatar, setReceiverAvatar] = useState("");
  const navigate = useNavigate();
  
  // Parse currentUserId as number and add debugging
  const currentUserIdStr = localStorage.getItem("user_id");
  const currentUserId = currentUserIdStr ? parseInt(currentUserIdStr) : null;
  
  // Debug logging
  console.log("🔍 Chat Debug:", {
    currentUserIdStr,
    currentUserId,
    receiverId,
    token: localStorage.getItem("token") ? "✅ Present" : "❌ Missing"
  });

  useEffect(() => {
    if (!receiverId || !currentUserId) {
      console.error("❌ Missing required data:", { receiverId, currentUserId });
      return;
    }

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const history = await axios.get(`http://localhost:5000/api/chat/history/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(
          history.data.map((msg: any) => ({
            sender: msg.sender_id === currentUserId ? "me" : "other",
            text: msg.message,
            time: new Date(msg.timestamp).toLocaleTimeString(),
          }))
        );

        const userRes = await axios.get(`http://localhost:5000/api/users/profile/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReceiverName(userRes.data.name);
        setReceiverAvatar(
          userRes.data.avatar
            ? `http://localhost:5000${userRes.data.avatar}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(userRes.data.name)}&background=8b5cf6&color=fff&rounded=true&size=64`
        );
      } catch (err) {
        console.error("Erreur chargement historique ou utilisateur:", err);
      }
    };

    fetchHistory();

    // Join room with proper number values
    socket.emit("join", { senderId: currentUserId, receiverId: parseInt(receiverId) });

    // ✅ Handle incoming messages from other users
    socket.on("receiveMessage", (msg) => {
      console.log("📨 Message reçu:", msg);
      setMessages((prev) => [...prev, { 
        sender: "other", 
        text: msg.text, 
        time: new Date(msg.timestamp).toLocaleTimeString() 
      }]);
    });

    // ✅ Handle message sent confirmation
    socket.on("messageSent", (confirmation) => {
      console.log("✅ Message sent confirmation:", confirmation);
    });

    // ✅ Handle errors
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
      alert("Erreur: " + error.message);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageSent");
      socket.off("error");
    };
  }, [receiverId, currentUserId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Validation before sending
    if (!currentUserId) {
      console.error("❌ Cannot send message: currentUserId is null");
      alert("Erreur: Vous devez être connecté pour envoyer un message");
      return;
    }
    
    if (!receiverId) {
      console.error("❌ Cannot send message: receiverId is missing");
      return;
    }

    const messageData = {
      senderId: currentUserId, // Now it's a number
      receiverId: parseInt(receiverId), // Ensure receiverId is also a number
      text: newMessage,
      time: new Date().toLocaleTimeString(),
    };
    
    console.log("📤 Sending message:", messageData);
    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, { sender: "me", text: newMessage, time: messageData.time }]);
    setNewMessage("");
  };

  // Show error if not logged in
  if (!currentUserId) {
    return (
      <div className="chat-page">
        <div className="chat-container">
          <h2>❌ Erreur d'authentification</h2>
          <p>Vous devez être connecté pour accéder au chat.</p>
          <button onClick={() => navigate("/login")}>Se connecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <form className="chat-container fade-in" onSubmit={handleSendMessage}>
        <button type="button" className="back-button" onClick={() => navigate("/users")}>
          ⬅️ Retour
        </button>

        <div className="chat-header">
          <h2>💬 Chat avec <span className="receiver-name">{receiverName}</span></h2>
          {receiverAvatar && (
            <img src={receiverAvatar} alt="avatar" className="chat-avatar" />
          )}
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender === "me" ? "sent" : "received"}`}>
              <div className="chat-text">{msg.text}</div>
              <div className="chat-time">{msg.time}</div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Tape ton message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Envoyer</button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
