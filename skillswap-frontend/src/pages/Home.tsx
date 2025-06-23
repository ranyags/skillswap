import "../styles/Home.scss";
import { useTranslation } from "react-i18next";
// Temporarily commented out the image import to test
// import illustration from "../assets/home-illustration.png";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="text-zone">
          <h1>{t("Bienvenue sur SkillSwap")} 👋</h1>
          <p>{t("Une plateforme pour échanger et partager vos compétences facilement.")}</p>
          <div className="cta-buttons">
            <a href="/register" className="btn-primary">{t("Créer un compte")}</a>
            <a href="/skills" className="btn-secondary">{t("Découvrir les compétences")}</a>
          </div>
        </div>
        {/* Temporarily commented out the image to test */}
        {/* <div className="image-zone">
          <img src={illustration} alt="Collaboration" />
        </div> */}
      </div>
    </div>
  );
};

export default Home;
