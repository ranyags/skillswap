import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaStar, FaUser, FaDownload, FaTools } from "react-icons/fa";
import { getSkills, getAllSkillAverages } from "../api/skillService";
import "../styles/ProfileSkills.scss";

interface Skill {
  id: number;
  name: string;
  description: string;
  zip_file?: string;
  user_id: number;
  user_name: string;
}

const ProfileSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    loadSkills();
    loadAverages();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      console.error("❌ Erreur chargement compétences :", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAverages = async () => {
    try {
      const data = await getAllSkillAverages();
      const mapped: { [key: number]: number } = {};
      data.forEach((item: any) => {
        mapped[item.skill_id] = item.average;
      });
      setAverages(mapped);
    } catch (error) {
      console.error("Erreur lors du chargement des moyennes :", error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="stars-container">
        {Array.from({ length: 5 }, (_, i) => (
          <FaStar 
            key={i} 
            size="14px"
            color={i < rating ? "#fbbf24" : "#e5e7eb"} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="competences-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>⏳ Chargement des compétences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="competences-container">
      <div className="competences-header">
        <div className="header-content">
          <div className="header-text">
            <h1>🚀 Compétences</h1>
            <p>Découvrez toutes les compétences de la communauté SkillSwap</p>
          </div>
          <div className="stats-card">
            <div className="stats-content">
              <span className="stats-number">{skills.length}</span>
              <span className="stats-label">Compétences disponibles</span>
            </div>
          </div>
        </div>
      </div>

      <div className="competences-grid">
        {skills.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛠️</div>
            <h3>Aucune compétence disponible</h3>
            <p>Les utilisateurs n'ont pas encore partagé leurs compétences</p>
          </div>
        ) : (
          skills.map((skill) => (
            <div key={skill.id} className="competence-card">
              <div className="competence-header">
                <div className="competence-info">
                  <FaTools className="competence-icon" />
                  <span className="competence-name">{skill.name}</span>
                </div>
                {averages[skill.id] !== undefined && (
                  <div className="rating-wrapper">
                    {renderStars(Math.round(averages[skill.id]))}
                    <span className="rating-number">{averages[skill.id] ? Number(averages[skill.id]).toFixed(1) : '0.0'}/5</span>
                  </div>
                )}
              </div>

              <div className="competence-body">
                <p className="competence-description">{skill.description}</p>
                
                <div className="competence-footer">
                  <div className="author-info">
                    <div className="author-avatar">
                      <FaUser />
                    </div>
                    <span className="author-name">Par: {skill.user_name}</span>
                  </div>

                  <div className="competence-actions">
                    {skill.zip_file && (
                      <a
                        href={`http://localhost:5000${skill.zip_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="download-button"
                      >
                        <FaDownload /> Télécharger ZIP
                      </a>
                    )}
                    
                    <Link to={`/skills/${skill.id}/avis`} className="reviews-button">
                      <FaStar /> Voir les avis
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileSkills;
