import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Register.scss";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    city: "",
    description: "",
    sexe: "",
    birthdate: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        country: form.country,
        city: form.city,
        description: form.description,
        sexe: form.sexe,
        birthdate: form.birthdate,
        role: "user"
      });

      setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Une erreur est survenue lors de l'inscription.");
      }
    }
  };

  return (
    <div className="register-page">
      <div className="register-card fade-in">
        <h2>
          Créer un compte <span className="highlight">SkillSwap</span>
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="name"
              placeholder="Entrez votre nom complet"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Entrez votre email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="Entrez votre mot de passe"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmation du mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmez votre mot de passe"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="text"
              name="phone"
              placeholder="Entrez votre numéro de téléphone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Pays</label>
            <input
              type="text"
              name="country"
              placeholder="Entrez votre pays"
              value={form.country}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Ville</label>
            <input
              type="text"
              name="city"
              placeholder="Entrez votre ville"
              value={form.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Sexe</label>
            <select
              name="sexe"
              value={form.sexe}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez votre sexe</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date de naissance</label>
            <input
              type="date"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description (vos compétences principales)</label>
            <textarea
              name="description"
              placeholder="Décrivez brièvement vos compétences"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {error && <div className="error-text">{error}</div>}
          {success && <div className="success-text">{success}</div>}

          <button type="submit" className="primary-button">
            S'inscrire
          </button>
        </form>

        <p className="login-link">
          Vous avez déjà un compte ? <span onClick={() => navigate("/login")}>Se connecter</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
