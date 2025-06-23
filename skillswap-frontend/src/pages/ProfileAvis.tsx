import { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaUser, FaCalendarAlt, FaTools } from "react-icons/fa";
import "../styles/ProfileAvis.scss";

interface Review {
  rating: number;
  comment: string;
  reviewer: string;
  created_at: string;
  skill_name: string;
}

const ProfileAvis = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");
        
        if (!userId) {
          console.error("No user ID found");
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/reviews/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const reviewsData = res.data;
        setReviews(reviewsData);
        
        // Calculate stats
        if (reviewsData.length > 0) {
          const total = reviewsData.length;
          const average = reviewsData.reduce((sum: number, review: Review) => sum + review.rating, 0) / total;
          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          
          reviewsData.forEach((review: Review) => {
            distribution[review.rating as keyof typeof distribution]++;
          });
          
          setStats({ total, average: Math.round(average * 10) / 10, distribution });
        }
      } catch (err) {
        console.error("Erreur chargement avis :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating: number, size: "small" | "large" = "small") => {
    const starSize = size === "large" ? "20px" : "16px";
    return (
      <div className="stars-container">
        {Array.from({ length: 5 }, (_, i) => (
          <FaStar 
            key={i} 
            size={starSize}
            color={i < rating ? "#fbbf24" : "#e5e7eb"} 
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="avis-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>⏳ Chargement de vos avis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="avis-container">
      <div className="avis-header">
        <div className="header-content">
          <div className="header-text">
            <h1>⭐ Avis Reçus</h1>
            <p>Découvrez ce que pensent les autres de vos compétences</p>
          </div>
          {reviews.length > 0 && (
            <div className="stats-card">
              <div className="average-score">
                <span className="score">{stats.average}</span>
                <div className="score-details">
                  {renderStars(Math.round(stats.average), "large")}
                  <span className="total-reviews">({stats.total} avis)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="avis-content">
        {reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Aucun avis reçu pour le moment</h3>
            <p>Partagez vos compétences pour recevoir vos premiers avis !</p>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review, index) => (
              <div key={`${review.skill_name}-${review.reviewer}-${index}`} className="review-card">
                <div className="review-header">
                  <div className="skill-info">
                    <FaTools className="skill-icon" />
                    <span className="skill-name">{review.skill_name}</span>
                  </div>
                  <div className="rating-wrapper">
                    {renderStars(review.rating)}
                    <span className="rating-number">{review.rating}/5</span>
                  </div>
                </div>
                
                <div className="review-body">
                  <p className="comment">"{review.comment}"</p>
                </div>
                
                <div className="review-footer">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      <FaUser />
                    </div>
                    <span className="reviewer-name">{review.reviewer}</span>
                  </div>
                  <div className="review-date">
                    <FaCalendarAlt className="date-icon" />
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvis;
