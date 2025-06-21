import axios from "axios";
const API_URL = "http://localhost:5000/api/skills";
/**
 * 🔐 Récupérer toutes les compétences (avec token)
 */
export const getSkills = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
/**
 * ➕ Ajouter une compétence avec fichier ZIP (FormData)
 */
export const addSkill = async (formData) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${API_URL}/add`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
};
/**
 * 🗑️ Supprimer une compétence par ID
 */
export const deleteSkill = async (id) => {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
/**
 * ✏️ Modifier une compétence (sans fichier ZIP)
 */
export const updateSkill = async (skill) => {
    const token = localStorage.getItem("token");
    await axios.put(`${API_URL}/${skill.id}`, skill, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
/**
 * ⭐ Obtenir les moyennes d'avis pour chaque compétence
 */
export const getAllSkillAverages = async () => {
    const res = await axios.get("http://localhost:5000/api/reviews/average/all");
    return res.data; // array of { skill_id, average }
};
