import { useState } from "react";
import axios from "axios";
import "../styles/AddReview.scss";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddReview = () => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validation قوية
    if (rating === 0) {
      toast.error("❌ Vous devez donner une note (1 à 5 étoiles).");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("❌ Le commentaire doit contenir au moins 10 caractères.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/reviews/add", 
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Avis ajouté avec succès !");
      
      setTimeout(() => {
        navigate("/avis"); // ✅ التوجيه إلى /avis بعد النجاح
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avis", error);
      toast.error("❌ Une erreur est survenue !");
    }
  };

  return (
    <div className="add-review-page">
      <div className="add-review-container fade-in">
        <h2>Ajouter un Avis ⭐</h2>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-stars">
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar
                key={index}
                size={30}
                color={index < rating ? "#facc15" : "#d1d5db"}
                onClick={() => setRating(index + 1)}
                className="star"
              />
            ))}
          </div>

          <textarea
            placeholder="Écrivez votre commentaire ici..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button type="submit">Envoyer l'avis</button>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
};

export default AddReview;
