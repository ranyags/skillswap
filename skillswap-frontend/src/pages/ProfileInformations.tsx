import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileInformations.scss";
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaCity, FaVenusMars, FaBirthdayCake, FaEdit, FaFileAlt } from "react-icons/fa";

const ProfileInformations = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        });
        console.log("👤 User data loaded:", res.data);
        console.log("🔍 Detailed field check:", {
          name: `"${res.data.name}"`,
          email: `"${res.data.email}"`, 
          phone: `"${res.data.phone}"`,
          country: `"${res.data.country}"`,
          city: `"${res.data.city}"`,
          sexe: `"${res.data.sexe}"`,
          birthdate: `"${res.data.birthdate}"`,
          bio: `"${res.data.bio}"`,
          description: `"${res.data.description}"`
        });
        setUser(res.data);
      } catch (err) {
        console.error("Erreur chargement profil :", err);
      } finally {
        setLoading(false);
      }
    };

    // Listen for profile updates
    const handleProfileUpdate = (event: any) => {
      console.log("🔄 Profile update event received in ProfileInformations", event.detail);
      if (event.detail && event.detail.id) {
        setUser(event.detail);
        console.log("✅ ProfileInformations updated with new data");
      } else {
        fetchProfile();
      }
    };

    fetchProfile();

    // Add event listener for profile updates
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [navigate]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return "—";
    }
  };

  // Helper function to display value or default
  const displayValue = (value: any) => {
    return value && value.trim() !== "" ? value : "—";
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!user) return <div className="loading">Erreur de chargement des données utilisateur</div>;

  return (
    <div className="info-container">
      <div className="info-card">
        <img
          src={
            user.avatar?.startsWith("/uploads/")
              ? `http://localhost:5000${user.avatar}?t=${Date.now()}`
              : user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=8b5cf6&color=fff&rounded=true&size=100`
          }
          alt="avatar"
          className="avatar"
        />

        <h2 className="title">📑 Informations Personnelles</h2>

        <ul className="info-list">
          <li>
            <FaUser /> 
            <strong>Nom :</strong> 
            <span>{displayValue(user.name)}</span>
          </li>
          <li>
            <FaEnvelope /> 
            <strong>Email :</strong> 
            <span>{displayValue(user.email)}</span>
          </li>
          <li>
            <FaPhone /> 
            <strong>Téléphone :</strong> 
            <span>{displayValue(user.phone)}</span>
          </li>
          <li>
            <FaGlobe /> 
            <strong>Pays :</strong> 
            <span>{displayValue(user.country)}</span>
          </li>
          <li>
            <FaCity /> 
            <strong>Ville :</strong> 
            <span>{displayValue(user.city)}</span>
          </li>
          <li>
            <FaVenusMars /> 
            <strong>Sexe :</strong> 
            <span>{displayValue(user.sexe)}</span>
          </li>
          <li>
            <FaBirthdayCake /> 
            <strong>Date de naissance :</strong> 
            <span>{formatDate(user.birthdate)}</span>
          </li>
          <li>
            <FaFileAlt /> 
            <strong>Description :</strong> 
            <span className="description">{displayValue(user.bio || user.description)}</span>
          </li>
        </ul>

        <button className="edit-btn" onClick={() => navigate("/profile/edit")}>
          <FaEdit /> Modifier le profil
        </button>
      </div>
    </div>
  );
};

export default ProfileInformations;
