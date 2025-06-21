import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaEdit, FaCog, FaStar, FaBell, FaComments } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Skills.scss";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import IAChat from "../components/IAChat"; // adapte le chemin

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { logoutUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No token found");
        navigate("/login");
        return;
      }

      try {
        console.log("🔄 Fetching profile...");
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        console.log("✅ Profile loaded:", res.data);
        setUser(res.data);

        if (location.state?.success) {
          toast.success(t(location.state.success));
          navigate(location.pathname, { replace: true, state: {} });
        }
      } catch (err: any) {
        console.error("❌ Erreur chargement profil :", err);
        if (err.response?.status === 401) {
          logoutUser();
        }
      }
    };

    const handleProfileUpdate = (event: any) => {
      if (event.detail && event.detail.id) {
        setUser(event.detail);
      } else {
        fetchProfile();
      }
    };

    fetchProfile();
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, [location, navigate, t, logoutUser]);

  const isActive = (path: string) => location.pathname === path;

  const generateAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&rounded=true&size=120`;
  };

  if (!user) {
    return (
      <div className="skills-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>⏳ {t("Chargement du profil...")}</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      path: "/profile/informations",
      icon: <FaUser />,
      label: "Informations",
      description: "Gérez vos informations personnelles",
      color: "#3b82f6",
    },
    {
      path: "/profile/competences",
      icon: <FaCog />,
      label: "Compétences",
      description: "Gérez vos compétences et expertises",
      color: "#8b5cf6",
    },
    {
      path: "/profile/avis",
      icon: <FaStar />,
      label: "Avis reçus",
      description: "Consultez les avis sur vos compétences",
      color: "#f59e0b",
    },
    {
      path: "/profile/notifications",
      icon: <FaBell />,
      label: "Notifications",
      description: "Restez informé des dernières activités",
      color: "#ef4444",
    },
    {
      path: "/profile/messages",
      icon: <FaComments />,
      label: "Messages",
      description: "Gérez vos conversations",
      color: "#10b981",
    },
  ];

  return (
    <div className="skills-container profile-page">
      <div className="skills-header">
        <div className="header-content">
          <div className="header-text">
            <h1>🎉 {t("Bienvenue dans votre espace personnel !")}</h1>
            <p>{t("Utilisez le menu ci-dessous pour naviguer entre les sections.")}</p>
          </div>
          <div className="stats-card">
            <div className="stats-content">
              <span className="stats-number">5</span>
              <span className="stats-label">Sections disponibles</span>
            </div>
          </div>
        </div>
      </div>

      <div className="skills-content">
        <div className="add-skill-section">
          <div className="add-skill-card" style={{ textAlign: "center", padding: "1.5rem 1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <img
                src={
                  user.avatar?.startsWith("/uploads/")
                    ? `http://localhost:5000${user.avatar}?t=${Date.now()}`
                    : user.avatar || generateAvatar(user.name)
                }
                alt="avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #8b5cf6",
                  marginBottom: "0.75rem",
                }}
                onError={(e) => {
                  e.currentTarget.src = generateAvatar(user.name);
                }}
              />
              <h2 style={{ color: "#1f2937", margin: "0.5rem 0 0.25rem 0", fontSize: "1.5rem", fontWeight: "700" }}>{user.name}</h2>
              <p style={{ color: "#374151", fontSize: "1rem", margin: "0 0 0.75rem 0", fontWeight: "500" }}>{user.email}</p>
              <button
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                  color: "white",
                  border: "none",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  transition: "all 0.3s ease",
                  fontSize: "0.9rem",
                }}
                onClick={() => navigate("/profile/edit")}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #7c3aed, #8b5cf6)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #8b5cf6, #a855f7)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <FaEdit />
                Modifier le profil
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`add-skill-card ${isActive(item.path) ? "active-card" : ""}`}
              style={{
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                border: isActive(item.path) ? `2px solid ${item.color}` : "2px solid transparent",
              }}
              onClick={() => navigate(item.path)}
              onMouseOver={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = `0 10px 30px ${item.color}20`;
                }
              }}
              onMouseOut={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${item.color}, ${item.color}AA)` }}></div>
              <div style={{ padding: "1.5rem", textAlign: "center" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem auto",
                    fontSize: "24px",
                    color: "white",
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ color: "#1f2937", margin: "0 0 0.5rem 0", fontSize: "1.3rem", fontWeight: "700", textAlign: "center" }}>{item.label}</h3>
                <p style={{ color: "#1f2937", margin: "0", fontSize: "0.9rem", lineHeight: "1.4", textAlign: "center", fontWeight: "500" }}>{item.description}</p>
                {isActive(item.path) && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.5rem 1rem",
                      background: `${item.color}15`,
                      borderRadius: "20px",
                      color: item.color,
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}
                  >
                    ✓ Section active
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ia-chat-floating">
      <IAChat />
</div>
    </div>
  );
};

export default Profile;