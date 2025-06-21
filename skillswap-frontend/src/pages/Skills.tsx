import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaUser, FaDownload, FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaTools, FaFileAlt } from "react-icons/fa";
import { getSkills, deleteSkill, updateSkill, addSkill, getAllSkillAverages } from "../api/skillService";
import "../styles/Skills.scss";

interface Skill {
  id: number;
  name: string;
  description: string;
  zip_file?: string;
  user_id: number;
  user_name: string;
}

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState({ name: "", description: "", zip_file: null as File | null });
  const [message, setMessage] = useState("");
  const [averages, setAverages] = useState<{ [key: number]: number }>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user ID from token or localStorage
    const userId = localStorage.getItem("user_id");
    if (userId) {
      setCurrentUserId(parseInt(userId));
    }
    
    loadSkills();
    loadAverages();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des compétences :", error);
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

  const handleDelete = async (id: number) => {
    // Double-check if the user owns this skill
    const skill = skills.find(s => s.id === id);
    if (!skill || skill.user_id !== currentUserId) {
      setMessage("❌ Vous ne pouvez supprimer que vos propres compétences");
      return;
    }

    try {
      await deleteSkill(id);
      setSkills(skills.filter((skill) => skill.id !== id));
      setMessage("✅ Compétence supprimée !");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setMessage("❌ Erreur lors de la suppression");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleEdit = (skill: Skill) => {
    // Only allow editing own skills
    if (skill.user_id !== currentUserId) {
      setMessage("❌ Vous ne pouvez modifier que vos propres compétences");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setEditSkill(skill);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editSkill) {
      setEditSkill({ ...editSkill, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async () => {
    if (!editSkill) return;
    try {
      await updateSkill(editSkill);
      setSkills(skills.map((s) => (s.id === editSkill.id ? editSkill : s)));
      setMessage("✅ Compétence mise à jour !");
      setEditSkill(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      setMessage("❌ Erreur lors de la mise à jour");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim() || !newSkill.description.trim()) {
      setMessage("❌ Veuillez remplir tous les champs obligatoires");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newSkill.name);
      formData.append("description", newSkill.description);
      if (newSkill.zip_file) formData.append("zip_file", newSkill.zip_file);

      await addSkill(formData);
      setMessage("✅ Compétence ajoutée !");
      setNewSkill({ name: "", description: "", zip_file: null });
      loadSkills();
      loadAverages();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      setMessage("❌ Erreur lors de l'ajout");
      setTimeout(() => setMessage(""), 3000);
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
      <div className="skills-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>⏳ Chargement des compétences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="skills-container">
      <div className="skills-header">
        <div className="header-content">
          <div className="header-text">
            <h1>🛠️ Compétences</h1>
            <p>Découvrez et partagez vos compétences avec la communauté</p>
          </div>
          <div className="stats-card">
            <div className="stats-content">
              <span className="stats-number">{skills.length}</span>
              <span className="stats-label">Compétences disponibles</span>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message-toast ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="skills-content">
        <div className="add-skill-section">
          <div className="add-skill-card">
            <h3><FaPlus /> Ajouter une nouvelle compétence</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom de la compétence *</label>
                <input
                  type="text"
                  placeholder="Ex: React.js, Python, Design..."
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  placeholder="Décrivez votre compétence en détail..."
                  value={newSkill.description}
                  onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                  className="form-textarea"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Fichier de projet (optionnel)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, zip_file: e.target.files?.[0] || null })
                    }
                    className="file-input"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="file-label">
                    <FaFileAlt />
                    {newSkill.zip_file ? newSkill.zip_file.name : "Choisir un fichier ZIP"}
                  </label>
                </div>
              </div>
            </div>
            <button className="add-button" onClick={handleAddSkill}>
              <FaPlus /> Ajouter la compétence
            </button>
          </div>
        </div>

        <div className="skills-grid">
          {skills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛠️</div>
              <h3>Aucune compétence disponible</h3>
              <p>Soyez le premier à partager vos compétences !</p>
            </div>
          ) : (
            skills.map((skill) => (
              <div key={skill.id} className="skill-card">
                <div className="skill-header">
                  <div className="skill-info">
                    <FaTools className="skill-icon" />
                    <span className="skill-name">{skill.name}</span>
                  </div>
                  {averages[skill.id] !== undefined && (
                    <div className="rating-wrapper">
                      {renderStars(Math.round(averages[skill.id]))}
                      <span className="rating-number">{averages[skill.id]}/5</span>
                    </div>
                  )}
                </div>

                {editSkill && editSkill.id === skill.id ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <input
                        type="text"
                        name="name"
                        value={editSkill.name}
                        onChange={handleChange}
                        className="edit-input"
                        placeholder="Nom de la compétence"
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        name="description"
                        value={editSkill.description}
                        onChange={handleChange}
                        className="edit-textarea"
                        placeholder="Description"
                        rows={3}
                      />
                    </div>
                    <div className="edit-actions">
                      <button className="save-button" onClick={handleUpdate}>
                        <FaSave /> Enregistrer
                      </button>
                      <button className="cancel-button" onClick={() => setEditSkill(null)}>
                        <FaTimes /> Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="skill-body">
                    <p className="skill-description">{skill.description}</p>
                    
                    <div className="skill-footer">
                      <div className="author-info">
                        <div className="author-avatar">
                          <FaUser />
                        </div>
                        <span className="author-name">Par: {skill.user_name}</span>
                      </div>

                      <div className="skill-actions">
                        {skill.zip_file && (
                          <a
                            href={`http://localhost:5000${skill.zip_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-button"
                          >
                            <FaDownload /> Télécharger
                          </a>
                        )}
                        
                        <Link to={`/skills/${skill.id}/avis`} className="reviews-button">
                          <FaStar /> Voir les avis
                        </Link>

                        {currentUserId && skill.user_id === currentUserId && (
                          <div className="owner-actions">
                            <button className="edit-button" onClick={() => handleEdit(skill)}>
                              <FaEdit /> Modifier
                            </button>
                            <button className="delete-button" onClick={() => handleDelete(skill.id)}>
                              <FaTrash /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Skills;
