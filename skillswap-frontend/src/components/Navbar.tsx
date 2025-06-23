import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { FaCog } from "react-icons/fa";
import "../styles/Navbar.scss";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; avatar?: string; role?: string } | null>(null);
  const { isLoggedIn, logoutUser, user: authUser } = useAuth();

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  // Check if current user is admin
  const isAdmin = () => {
    return authUser?.role === 'admin' || user?.role === 'admin';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token || !isLoggedIn) {
        setUser(null);
        return;
      }
      
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ 
          name: res.data.name, 
          avatar: res.data.avatar,
          role: res.data.role 
        });
      } catch (error) {
        console.error("❌ Erreur chargement profil :", error);
        // If error fetching profile, likely token is invalid
        if (error.response?.status === 401) {
          logoutUser();
        }
        setUser(null);
      }
    };

    // Listen for logout events
    const handleLogoutEvent = () => {
      console.log("🔄 Logout event received in Navbar");
      setUser(null);
    };

    // Listen for any auth changes
    const handleAuthChange = () => {
      console.log("🔄 Auth change event received in Navbar");
      setUser(null);
    };

    // Listen for profile updates
    const handleProfileUpdate = (event: any) => {
      console.log("🔄 Profile update event received in Navbar", event.detail);
      if (event.detail && isLoggedIn) {
        setUser({ 
          name: event.detail.name, 
          avatar: event.detail.avatar,
          role: event.detail.role || user?.role
        });
      } else if (isLoggedIn) {
        // Refetch profile data if no detail provided
        fetchProfile();
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    } else {
      setUser(null);
    }

    // Add event listeners for logout, auth changes, and profile updates
    window.addEventListener('logout', handleLogoutEvent);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('logout', handleLogoutEvent);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [isLoggedIn, logoutUser]);

  const handleLogout = () => {
    console.log("🔄 Logout button clicked - force clearing all state");
    
    // Immediately clear user state
    setUser(null);
    
    // Force clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");
    sessionStorage.clear();
    
    // Call the AuthContext logout
    logoutUser();
    
    // Force redirect to homepage after short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">{t("Accueil")}</Link>
        {isLoggedIn ? (
          <>
            <Link to="/profile">{t("Profil")}</Link>
            <Link to="/users">{t("Discussions")}</Link>
            <Link to="/skills">Compétences</Link>
            {isAdmin() && (
              <Link to="/admin" className="admin-link">
                <FaCog /> Admin
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login">{t("Login")}</Link>
            <Link to="/register">{t("Register")}</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {user && isLoggedIn && (
          <span className="username">
            <img
              src={
                user.avatar
                  ? `http://localhost:5000${user.avatar}?t=${Date.now()}`
                  : "https://via.placeholder.com/30"
              }
              alt="avatar"
              className="avatar"
            />
            {user.name}
            {isAdmin() && <span className="admin-badge">Admin</span>}
          </span>
        )}
        {isLoggedIn && (
          <button className="logout-button" onClick={handleLogout}>
            {t("Déconnexion")}
          </button>
        )}
        <select
          className="lang-select"
          onChange={(e) => changeLanguage(e.target.value)}
          value={i18n.language}
        >
          <option value="fr">🇫🇷 FR</option>
          <option value="en">🇬🇧 EN</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;
