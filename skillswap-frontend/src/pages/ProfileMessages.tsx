"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { FaComments, FaUser, FaClock, FaSearch, FaUsers } from "react-icons/fa"
import "../styles/Skills.scss"

interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface Message {
  sender_id: number
  receiver_id: number
  message: string
  created_at: string
}

interface ConversationStats {
  totalConversations: number
  unreadMessages: number
  todayMessages: number
}

const ProfileMessages = () => {
  const [conversations, setConversations] = useState<Array<User & { lastMessage: Message }>>([])
  const [stats, setStats] = useState<ConversationStats>({ totalConversations: 0, unreadMessages: 0, todayMessages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
  const currentUserId = Number(localStorage.getItem("user_id"))

  // Generate smart SVG avatar
  const generateAvatar = (name: string) => {
    const colors = ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"] // Changed to blue shades
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    const color = colors[name.length % colors.length]

    const svgData = `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}CC;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#grad)" />
        <text x="32" y="40" fontFamily="Arial" fontSize="20" fontWeight="bold" 
              textAnchor="middle" fill="white">${initials}</text>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  useEffect(() => {
    console.log("🔍 ProfileMessages - Starting to load conversations...")

    const fetchConversations = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        console.log("❌ No token found")
        navigate("/login")
        return
      }

      try {
        console.log("📡 Fetching conversations data...")
        const headers = { Authorization: `Bearer ${token}` }

        const [userRes, msgRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/all-users", { headers }),
          axios.get("http://localhost:5000/api/chat/last-message", { headers }),
        ])

        console.log("✅ Raw data received:", {
          users: userRes.data?.length || 0,
          messages: msgRes.data?.length || 0,
        })

        const allUsers: User[] = userRes.data
        const messages: Message[] = msgRes.data

        // Create mapping of user conversations
        const userMessages: { [key: number]: Message } = {}
        messages.forEach((msg) => {
          const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id
          userMessages[otherId] = msg
        })

        // Only include users who have actual conversations
        const conversationsWithUsers = allUsers
          .filter((user) => user.id !== currentUserId && userMessages[user.id])
          .map((user) => ({
            ...user,
            lastMessage: userMessages[user.id],
          }))
          .sort((a, b) => {
            const dateA = new Date(a.lastMessage.created_at).getTime()
            const dateB = new Date(b.lastMessage.created_at).getTime()
            return dateB - dateA // Most recent first
          })

        console.log("💬 Processed conversations:", conversationsWithUsers.length)
        setConversations(conversationsWithUsers)

        // Calculate stats
        const today = new Date().toDateString()
        const todayMessages = messages.filter((msg) => new Date(msg.created_at).toDateString() === today).length

        setStats({
          totalConversations: conversationsWithUsers.length,
          unreadMessages: 0, // Could be enhanced later
          todayMessages,
        })

        setError("")
      } catch (error) {
        console.error("❌ Error loading conversations:", error)
        setError("Erreur lors du chargement des conversations")
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [currentUserId, navigate])

  const handleStartChat = (receiverId: number) => {
    console.log(`🚀 Starting chat with user ${receiverId}`)
    navigate(`/chat/${receiverId}`)
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "À l'instant"
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`
    return date.toLocaleDateString()
  }

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.message.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="skills-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>⏳ Chargement de vos conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="skills-container">
      {/* Header Section */}
      <div className="skills-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <span className="emoji-icon">💬</span> Mes Conversations
            </h1>
            <p>Gérez vos échanges avec les autres membres</p>
          </div>
          <div className="stats-card">
            <div className="stats-content">
              <span className="stats-number">{stats.totalConversations}</span>
              <div style={{ color: "#f0f9ff", fontSize: "0.9rem" }}>Conversations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && <div className="message-toast error">{error}</div>}

      {/* Main Content */}
      <div className="skills-content">
        {/* Search Section */}
        <div className="search-container">
          <div className="search-wrapper">
            <div className="search-icon">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Rechercher un contact ou un message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon messages-icon">
              <FaComments />
            </div>
            <div className="stat-number">{stats.totalConversations}</div>
            <div className="stat-label">Conversations</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon clock-icon">
              <FaClock />
            </div>
            <div className="stat-number">{stats.todayMessages}</div>
            <div className="stat-label">Messages aujourd'hui</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon user-icon">
              <FaUser />
            </div>
            <div className="stat-number">{stats.unreadMessages}</div>
            <div className="stat-label">Non lus</div>
          </div>
        </div>

        {/* Conversations Grid */}
        {filteredConversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-icon">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="60" fill="white" fillOpacity="0.2" />
                  <circle cx="60" cy="60" r="50" fill="white" fillOpacity="0.2" />
                  <circle cx="60" cy="60" r="40" fill="white" fillOpacity="0.3" />
                  <path
                    d="M75 45H45C42.25 45 40 47.25 40 50V80L50 70H75C77.75 70 80 67.75 80 65V50C80 47.25 77.75 45 75 45Z"
                    fill="white"
                  />
                  <circle cx="52.5" cy="57.5" r="2.5" fill="#3b82f6" />
                  <circle cx="60" cy="57.5" r="2.5" fill="#3b82f6" />
                  <circle cx="67.5" cy="57.5" r="2.5" fill="#3b82f6" />
                </svg>
              </div>
              <h2>Aucune conversation</h2>
              <p>Vous n'avez pas encore de conversations. Commencez par découvrir d'autres utilisateurs!</p>
              <button className="discover-button" onClick={() => navigate("/users")}>
                <FaUsers className="button-icon" />
                <span>Découvrir des utilisateurs</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="conversations-grid">
            {filteredConversations.map((conversation) => {
              const avatarUrl = conversation.avatar
                ? `http://localhost:5000${conversation.avatar}`
                : generateAvatar(conversation.name)

              return (
                <div key={conversation.id} className="conversation-card">
                  <div className="conversation-header">
                    <img
                      src={avatarUrl || "/placeholder.svg"}
                      alt={conversation.name}
                      className="avatar"
                      onError={(e) => {
                        e.currentTarget.src = generateAvatar(conversation.name)
                      }}
                    />
                    <div className="user-info">
                      <h4 className="user-name">{conversation.name}</h4>
                      <p className="user-email">{conversation.email}</p>
                      <span className="timestamp">
                        <FaClock className="clock-icon" />
                        {formatRelativeTime(conversation.lastMessage.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="message-preview">
                    <div className="sender">
                      {conversation.lastMessage.sender_id === currentUserId ? "Vous" : conversation.name}:
                    </div>
                    <div className="message-text">{conversation.lastMessage.message}</div>
                  </div>

                  <button className="continue-button" onClick={() => handleStartChat(conversation.id)}>
                    <FaComments className="button-icon" />
                    <span>Continuer la conversation</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileMessages
