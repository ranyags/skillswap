import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Informations.scss";

const Informations = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      }
    };
    fetchProfile();
  }, []);

  if (!user) return <div className="loading">Chargement des informations...</div>;

  return (
    <div className="informations-section">
      <h2 className="section-title">📄 Informations personnelles</h2>
      <div className="info-card">
        <ul>
          <li><strong>Nom:</strong> {user.name}</li>
          <li><strong>Email:</strong> {user.email}</li>
          <li><strong>Téléphone:</strong> {user.phone || "—"}</li>
          <li><strong>Pays:</strong> {user.country || "—"}</li>
          <li><strong>Ville:</strong> {user.city || "—"}</li>
          <li><strong>Sexe:</strong> {user.sexe || "—"}</li>
          <li><strong>Date de naissance:</strong> {user.birthdate?.slice(0, 10) || "—"}</li>
        </ul>
      </div>
    </div>
  );
};

export default Informations;
