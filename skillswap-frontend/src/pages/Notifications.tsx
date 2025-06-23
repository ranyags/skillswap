import { useState, useEffect } from "react";
import axios from "axios";
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTrash, FaCheck, FaClock } from "react-icons/fa";
import "../styles/Notifications.scss";

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  type: "success" | "warning" | "info";
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "success" | "warning" | "info">("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    success: 0,
    warning: 0,
    info: 0
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const adaptedData = response.data.map((notif: any) => ({
        id: notif.id,
        message: notif.message,
        isRead: notif.is_read,
        type: notif.type || "info",
        created_at: notif.created_at,
      }));

      setNotifications(adaptedData);
      
      // Calculate stats
      const total = adaptedData.length;
      const unread = adaptedData.filter((n: Notification) => !n.isRead).length;
      const success = adaptedData.filter((n: Notification) => n.type === 'success').length;
      const warning = adaptedData.filter((n: Notification) => n.type === 'warning').length;
      const info = adaptedData.filter((n: Notification) => n.type === 'info').length;
      
      setStats({ total, unread, success, warning, info });

    } catch (error) {
      console.error("Erreur API notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      
      setStats(prev => ({ ...prev, unread: prev.unread - 1 }));

    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/notifications/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setStats(prev => ({ ...prev, unread: 0 }));

    } catch (error) {
      console.error("Erreur lors de la mise à jour des notifications", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const deletedNotif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        unread: deletedNotif && !deletedNotif.isRead ? prev.unread - 1 : prev.unread,
        [deletedNotif?.type || 'info']: prev[deletedNotif?.type || 'info'] - 1
      }));

    } catch (error) {
      console.error("Erreur lors de la suppression de la notification", error);
    }
  };

  const filteredNotifications = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const renderIcon = (type: string) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="notification-icon success" />;
      case "warning":
        return <FaExclamationTriangle className="notification-icon warning" />;
      case "info":
      default:
        return <FaInfoCircle className="notification-icon info" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Il y a quelques minutes";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return "Hier";
    return date.toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>⏳ Chargement de vos notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-content">
          <div className="header-text">
            <h1><FaBell /> Mes Notifications</h1>
            <p>Restez informé de toutes vos activités</p>
          </div>
          <div className="stats-card">
            <div className="stats-content">
              <span className="stats-number">{stats.unread}</span>
              <span className="stats-label">Non lues</span>
            </div>
          </div>
        </div>
      </div>

      <div className="notifications-content">
        <div className="filter-section">
          <div className="filter-buttons">
            <button 
              className={filter === "all" ? "active" : ""} 
              onClick={() => setFilter("all")}
            >
              Tout ({stats.total})
            </button>
            <button 
              className={filter === "success" ? "active success" : "success"} 
              onClick={() => setFilter("success")}
            >
              <FaCheckCircle /> Succès ({stats.success})
            </button>
            <button 
              className={filter === "warning" ? "active warning" : "warning"} 
              onClick={() => setFilter("warning")}
            >
              <FaExclamationTriangle /> Alertes ({stats.warning})
            </button>
            <button 
              className={filter === "info" ? "active info" : "info"} 
              onClick={() => setFilter("info")}
            >
              <FaInfoCircle /> Infos ({stats.info})
            </button>
          </div>
          
          {stats.unread > 0 && (
            <button className="mark-all-read-btn" onClick={markAllAsRead}>
              <FaCheck /> Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Aucune notification trouvée</h3>
              <p>
                {filter === "all" 
                  ? "Vous n'avez aucune notification pour le moment."
                  : `Aucune notification de type "${filter}" trouvée.`
                }
              </p>
            </div>
          ) : (
            <div className="notifications-grid">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-card ${notification.isRead ? 'read' : 'unread'} ${notification.type}`}
                >
                  <div className="notification-header">
                    <div className="notification-info">
                      {renderIcon(notification.type)}
                      <div className="notification-status">
                        {!notification.isRead && (
                          <div className="unread-indicator">
                            <FaClock size="12px" />
                            <span>Nouveau</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="notification-actions">
                      {!notification.isRead && (
                        <button 
                          className="mark-read-btn"
                          onClick={() => markAsRead(notification.id)}
                          title="Marquer comme lu"
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={() => deleteNotification(notification.id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="notification-body">
                    <p className="notification-message">{notification.message}</p>
                  </div>
                  
                  <div className="notification-footer">
                    <span className="notification-date">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
