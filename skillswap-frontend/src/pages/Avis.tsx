import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReviews, addReview, getAverageRating } from "../api/reviewService";
import "../styles/Avis.scss";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

interface Review {
  id: number;
  reviewer: string;
  rating: number;
  comment: string;
  created_at: string;
}

const Avis = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [average, setAverage] = useState<number | null>(null);

  useEffect(() => {
    if (skillId) {
      fetchReviews();
      fetchAverage();
    }
  }, [skillId]);

  const fetchReviews = async () => {
    try {
      const data = await getReviews(skillId!);
      setReviews(data);
    } catch (err) {
      console.error("Erreur lors du chargement des avis :", err);
      toast.error("❌ Erreur lors du chargement des avis.");
    }
  };

  const fetchAverage = async () => {
    try {
      const data = await getAverageRating(skillId!);
      setAverage(data.average);
    } catch (err) {
      console.error("Erreur lors de la moyenne :", err);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillId) {
      toast.error("❌ skillId manquant dans l'URL.");
      return;
    }
    try {
      await addReview(skillId, newRating, newComment);
      toast.success("✅ Avis ajouté avec succès !");
      setNewRating(5);
      setNewComment("");
      setShowModal(false);
      fetchReviews();
      fetchAverage();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avis", error);
      toast.error("❌ Erreur lors de l'ajout.");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} color={i < rating ? "#fbbf24" : "#e5e7eb"} />
    ));
  };

  return (
    <div className="avis-page-pro">

      {/* ✅ Bouton Retour au profil */}
      <button className="back-button-top" onClick={() => navigate("/profile")}>
        🔙 Retour au profil
      </button>

      <div className="avis-header-pro">
        <span className="icon">💬</span>
        <h2>Avis Reçus</h2>
        <button className="add-button" onClick={() => setShowModal(true)}>+ Ajouter un avis</button>
      </div>

      {average !== null && (
        <p className="average-rating">⭐ Moyenne : {average} / 5</p>
      )}

      <div className="avis-list-pro">
        {reviews.length === 0 ? (
          <p className="empty">Aucun avis trouvé.</p>
        ) : (
          reviews.map((review) => (
            <div className="avis-card-pro" key={review.id}>
              <img
                className="avatar"
                src={`data:image/svg+xml;base64,${btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
                    <rect width="64" height="64" fill="#8b5cf6"/>
                    <text x="32" y="32" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial" font-size="24" font-weight="bold">
                      ${(review.reviewer || 'U').charAt(0).toUpperCase()}
                    </text>
                  </svg>
                `)}`}
                alt={review.reviewer}
              />
              <div className="avis-info">
                <div className="avis-top">
                  <span className="name">{review.reviewer}</span>
                  <span className="stars">{renderStars(review.rating)}</span>
                </div>
                <div className="date">
                  {new Date(review.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <p className="comment">{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Ajouter un avis</h3>
            <form onSubmit={handleAddReview} className="modal-form">
              <label>Note :</label>
              <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>{star} ⭐</option>
                ))}
              </select>
              <label>Commentaire :</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Votre avis ici..."
                required
              />
              <div className="modal-actions">
                <button type="submit">Envoyer</button>
                <button type="button" onClick={() => setShowModal(false)} className="cancel">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avis;
