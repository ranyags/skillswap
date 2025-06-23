import axios from "axios";
// ✅ Récupérer les avis d'une compétence
export const getReviews = async (skillId) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`http://localhost:5000/api/reviews/skill/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
export const getAverageRating = async (skillId) => {
    const res = await axios.get(`http://localhost:5000/api/reviews/skill/${skillId}/average`);
    return res.data;
};
// ✅ Ajouter un avis
export const addReview = async (skillId, rating, comment) => {
    const token = localStorage.getItem("token");
    const res = await axios.post("http://localhost:5000/api/reviews/add", { skill_id: skillId, rating, comment }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
