import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaSearch, FaComments, FaEnvelope, FaClock } from "react-icons/fa";
import "../styles/Skills.scss";

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

const Discussions = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [lastMessages, setLastMessages] = useState<{ [key: number]: Message }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem("user_id"));

  // Generate smart SVG avatar
  const generateAvatar = (name: string) => {
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const color = colors[name.length % colors.length];
    
    const svgData = `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}CC;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#grad-${name})" />
        <text x="32" y="40" font-family="Arial" font-size="20" font-weight="bold" 
              text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  useEffect(() => {
    console.log("🔍 Discussions - Starting to load users...");
    
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No token found");
        navigate("/login");
        return;
      }

      try {
        console.log("📡 Fetching users and messages data...");
        const headers = { Authorization: `Bearer ${token}` };

        const [userRes, msgRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/all-users", { headers }),
          axios.get("http://localhost:5000/api/chat/last-message", { headers }),
        ]);

        console.log("✅ Raw data received:", {
          users: userRes.data?.length || 0,
          messages: msgRes.data?.length || 0
        });

        setUsers(userRes.data);
        setError("");

        const messages: Message[] = msgRes.data;
        const mapping: { [key: number]: Message } = {};

        for (const msg of messages) {
          const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
          mapping[otherId] = msg;
        }

        setLastMessages(mapping);
        console.log("✅ Discussions data loaded successfully");
      } catch (err) {
        console.error("❌ Error loading discussions:", err);
        setError("Erreur lors du chargement des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, currentUserId]);

  const handleChat = (receiverId: number) => {
    console.log(`🚀 Starting chat with user ${receiverId}`);
    navigate(`/chat/${receiverId}`);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "En ligne";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`;
    return date.toLocaleDateString();
  };

  // Filter users based on search term
  const filteredUsers = users
    .filter(user => user.id !== currentUserId)
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by: 1) has messages, 2) recent messages first
      const msgA = lastMessages[a.id];
      const msgB = lastMessages[b.id];
      
      if (msgA && !msgB) return -1;
      if (!msgA && msgB) return 1;
      if (msgA && msgB) {
        const dateA = new Date(msgA.created_at).getTime();
        const dateB = new Date(msgB.created_at).getTime();
        return dateB - dateA;
      }
      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return (
      <div className="skills-container" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '2rem' 
      }}>
        <div className="loading-spinner" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <p style={{
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            ⏳ Chargement des utilisateurs...
          </p>
        </div>
      </div>
    );
  }

  const usersWithMessages = filteredUsers.filter(user => lastMessages[user.id]);
  const usersWithoutMessages = filteredUsers.filter(user => !lastMessages[user.id]);

  return (
    <>
      <div 
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {/* Force purple background with direct styles */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ 
              color: 'white', 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              margin: '0 0 0.5rem 0', 
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' 
            }}>
              👥 Utilisateurs
            </h1>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '1.1rem', 
              margin: '0' 
            }}>
              Découvrez et connectez-vous avec d'autres membres
            </p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            minWidth: '200px'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: '#fbbf24',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              lineHeight: '1'
            }}>
              {filteredUsers.length}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.9rem',
              fontWeight: '500',
              marginTop: '0.5rem'
            }}>
              Utilisateurs disponibles
            </div>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            fontWeight: '600',
            zIndex: '1000',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}

        {/* Search Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          marginBottom: '2rem',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #8b5cf6, #a855f7, #c084fc)'
          }}></div>
          <h3 style={{
            color: '#1f2937',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaSearch style={{ color: '#8b5cf6' }} /> Rechercher un utilisateur
          </h3>
          <div>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
              fontSize: '0.9rem'
            }}>
              Rechercher par nom ou email
            </label>
            <input
              type="text"
              placeholder="Nom d'utilisateur ou adresse email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Show users in simple format to test */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>👥 Tous les utilisateurs</h3>
          {filteredUsers.length === 0 ? (
            <p style={{ color: '#374151', textAlign: 'center', fontSize: '1.1rem' }}>
              {searchTerm ? `Aucun utilisateur trouvé pour "${searchTerm}"` : 'Aucun utilisateur disponible'}
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredUsers.map((user) => {
                const msg = lastMessages[user.id];
                const avatarUrl = user.avatar
                  ? `http://localhost:5000${user.avatar}`
                  : generateAvatar(user.name);

                return (
                  <div 
                    key={user.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#8b5cf6';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <img 
                      src={avatarUrl} 
                      alt={user.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: '3px solid #8b5cf6'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = generateAvatar(user.name);
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#1f2937', margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                        {user.name}
                      </h4>
                      <p style={{ color: '#374151', margin: '0', fontSize: '0.85rem' }}>
                        {user.email}
                      </p>
                      {msg && (
                        <p style={{ color: '#8b5cf6', margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
                          💬 {msg.message} • {formatRelativeTime(msg.created_at)}
                        </p>
                      )}
                    </div>
                    <button 
                      style={{
                        background: msg ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleChat(user.id)}
                    >
                      💬 {msg ? 'Continuer' : 'Commencer'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Discussions; 