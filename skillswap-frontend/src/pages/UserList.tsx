import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaComments, FaUser } from "react-icons/fa";
import "../styles/UserList.scss";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Message {
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [lastMessages, setLastMessages] = useState<{ [key: number]: Message }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem("user_id"));

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [userRes, msgRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/all-users", { headers }),
          axios.get("http://localhost:5000/api/chat/last-message", { headers }),
        ]);

        setUsers(userRes.data);
        setError("");

        const messages: Message[] = msgRes.data;
        const mapping: { [key: number]: Message } = {};

        for (const msg of messages) {
          const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
          mapping[otherId] = msg;
        }

        setLastMessages(mapping);
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs :", err);
        setError("Erreur lors du chargement des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleChat = (receiverId: number) => {
    navigate(`/chat/${receiverId}`);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUserId &&
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const dateA = lastMessages[a.id]?.created_at ?? "0000";
    const dateB = lastMessages[b.id]?.created_at ?? "0000";
    return dateB.localeCompare(dateA);
  });

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>⏳ Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="users-header">
        <div className="header-content">
          <div className="header-text">
            <h1>👥 Utilisateurs</h1>
            <p>Connectez-vous avec la communauté SkillSwap</p>
          </div>
          <div className="stats-card">
            <div className="stats-content">
              <span className="stats-number">{filteredUsers.length}</span>
              <span className="stats-label">Utilisateurs disponibles</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="message-toast error">
          {error}
        </div>
      )}

      <div className="users-content">
        <div className="search-section">
          <div className="search-card">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="users-grid">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Aucun utilisateur trouvé</h3>
              <p>{searchTerm ? "Essayez un autre terme de recherche" : "Aucun utilisateur disponible pour le moment"}</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const msg = lastMessages[user.id];
              const avatarUrl = user.avatar
                ? `http://localhost:5000${user.avatar}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5cf6&color=fff&rounded=true&size=64`;

              return (
                <div key={user.id} className="user-card">
                  <div className="user-header">
                    <div className="user-info">
                      <div className="avatar-container">
                        <img src={avatarUrl} alt={user.name} className="avatar" />
                        <span className="status-dot online"></span>
                      </div>
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="user-body">
                    {msg && (
                      <div className="last-message">
                        <p className="message-text">💬 {msg.message}</p>
                        <span className="message-time">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="user-footer">
                      <div className="user-actions">
                        <button className="chat-button" onClick={() => handleChat(user.id)}>
                          <FaComments /> Discuter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
