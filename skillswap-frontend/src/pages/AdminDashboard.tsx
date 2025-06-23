import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  FaUsers, 
  FaCog, 
  FaComments, 
  FaTrash, 
  FaEye, 
  FaUserPlus,
  FaChartLine,
  FaSearch,
  FaFilter
} from "react-icons/fa";
import "../styles/AdminDashboard.scss";

interface Stats {
  users: number;
  skills: number;
  reviews: number;
  recentUsers: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  country: string;
  city: string;
  created_at: string;
}

interface Skill {
  id: number;
  title: string;
  description: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  reviewed_name: string;
  skill_title: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState<Stats>({ users: 0, skills: 0, reviews: 0, recentUsers: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const apiConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Load stats on component mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "users":
        loadUsers();
        break;
      case "skills":
        loadSkills();
        break;
      case "reviews":
        loadReviews();
        break;
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/stats", apiConfig);
      setStats(response.data);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des statistiques");
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/users", apiConfig);
      setUsers(response.data);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/skills", apiConfig);
      setSkills(response.data);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des compétences");
      toast.error("Erreur lors du chargement des compétences");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/reviews", apiConfig);
      setReviews(response.data);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des avis");
      toast.error("Erreur lors du chargement des avis");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, apiConfig);
      toast.success("Utilisateur supprimé avec succès");
      loadUsers();
      loadStats(); // Refresh stats
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const deleteSkill = async (skillId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette compétence ?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/skills/${skillId}`, apiConfig);
      toast.success("Compétence supprimée avec succès");
      loadSkills();
      loadStats(); // Refresh stats
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/reviews/${reviewId}`, apiConfig);
      toast.success("Avis supprimé avec succès");
      loadReviews();
      loadStats(); // Refresh stats
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterData = (data: any[], searchFields: string[]) => {
    if (!searchTerm) return data;
    return data.filter(item =>
      searchFields.some(field =>
        item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const renderStatsTab = () => (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="stat-card users-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.users}</h3>
            <p>Utilisateurs Total</p>
            <small>{stats.recentUsers} nouveaux cette semaine</small>
          </div>
        </div>
        
        <div className="stat-card skills-card">
          <div className="stat-icon">
            <FaCog />
          </div>
          <div className="stat-content">
            <h3>{stats.skills}</h3>
            <p>Compétences</p>
          </div>
        </div>
        
        <div className="stat-card reviews-card">
          <div className="stat-icon">
            <FaComments />
          </div>
          <div className="stat-content">
            <h3>{stats.reviews}</h3>
            <p>Avis</p>
          </div>
        </div>
        
        <div className="stat-card growth-card">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{stats.recentUsers}</h3>
            <p>Nouveaux Utilisateurs</p>
            <small>Cette semaine</small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => {
    const filteredUsers = filterData(users, ['name', 'email', 'country', 'city']);
    
    return (
      <div className="table-container">
        <div className="table-header">
          <h3>Gestion des Utilisateurs ({users.length})</h3>
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Localisation</th>
                <th>Date d'inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.city ? `${user.city}, ${user.country}` : user.country || '-'}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="delete-btn"
                        onClick={() => deleteUser(user.id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSkillsTab = () => {
    const filteredSkills = filterData(skills, ['title', 'description', 'user_name']);
    
    return (
      <div className="table-container">
        <div className="table-header">
          <h3>Gestion des Compétences ({skills.length})</h3>
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Rechercher une compétence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Propriétaire</th>
                <th>Description</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((skill) => (
                <tr key={skill.id}>
                  <td>#{skill.id}</td>
                  <td>{skill.title}</td>
                  <td>{skill.user_name}</td>
                  <td className="description-cell">
                    {skill.description?.substring(0, 100)}
                    {skill.description?.length > 100 && '...'}
                  </td>
                  <td>{formatDate(skill.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="delete-btn"
                        onClick={() => deleteSkill(skill.id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReviewsTab = () => {
    const filteredReviews = filterData(reviews, ['reviewer_name', 'reviewed_name', 'skill_title', 'comment']);
    
    return (
      <div className="table-container">
        <div className="table-header">
          <h3>Gestion des Avis ({reviews.length})</h3>
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Rechercher un avis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Note</th>
                <th>Évaluateur</th>
                <th>Évalué</th>
                <th>Compétence</th>
                <th>Commentaire</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id}>
                  <td>#{review.id}</td>
                  <td>
                    <div className="rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </td>
                  <td>{review.reviewer_name}</td>
                  <td>{review.reviewed_name}</td>
                  <td>{review.skill_title}</td>
                  <td className="comment-cell">
                    {review.comment?.substring(0, 80)}
                    {review.comment?.length > 80 && '...'}
                  </td>
                  <td>{formatDate(review.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="delete-btn"
                        onClick={() => deleteReview(review.id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Tableau de bord administrateur</h1>
        <p>Gérez votre plateforme SkillSwap</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("stats");
            setSearchTerm("");
          }}
        >
          <FaChartLine /> Statistiques
        </button>
        <button
          className={`nav-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("users");
            setSearchTerm("");
          }}
        >
          <FaUsers /> Utilisateurs
        </button>
        <button
          className={`nav-btn ${activeTab === "skills" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("skills");
            setSearchTerm("");
          }}
        >
          <FaCog /> Compétences
        </button>
        <button
          className={`nav-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("reviews");
            setSearchTerm("");
          }}
        >
          <FaComments /> Avis
        </button>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        ) : (
          <>
            {activeTab === "stats" && renderStatsTab()}
            {activeTab === "users" && renderUsersTab()}
            {activeTab === "skills" && renderSkillsTab()}
            {activeTab === "reviews" && renderReviewsTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;