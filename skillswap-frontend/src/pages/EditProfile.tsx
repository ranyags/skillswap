import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/EditProfile.scss";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    city: "",
    bio: "",
    phone: "",
    birthdate: "",
    sexe: "",
    avatar: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          country: res.data.country || "",
          city: res.data.city || "",
          bio: res.data.bio || "",
          phone: res.data.phone || "",
          birthdate: res.data.birthdate?.slice(0, 10) || "",
          sexe: res.data.sexe || "",
          avatar: res.data.avatar || "",
        });
        setPreviewUrl(res.data.avatar ? `http://localhost:5000${res.data.avatar}` : null);
      } catch (err) {
        console.error("Erreur chargement profil :", err);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key !== "avatar") formData.append(key, val as string);
    });

    if (file) {
      formData.append("avatar", file);
    } else {
      formData.append("avatar", form.avatar);
    }

    try {
      const res = await axios.put("http://localhost:5000/api/users/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Profile updated successfully:", res.data);

      if (res.data.avatar) {
        const newAvatarUrl = `http://localhost:5000${res.data.avatar}?t=${Date.now()}`;
        setPreviewUrl(newAvatarUrl);
        setForm(prev => ({ ...prev, avatar: res.data.avatar }));
      }

      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: res.data
      }));

      toast.success("✅ Profil mis à jour avec succès !");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      console.error("❌ Erreur mise à jour :", err);
      toast.error("Erreur lors de la mise à jour !");
    }
  };

  if (!user) return <div className="loading">Chargement du profil...</div>;

  return (
    <div className="edit-wrapper">
      <form className="edit-card" onSubmit={handleSubmit}>

        {/* 🔙 Retour button intégré dans le formulaire */}
        <button type="button" className="back-button-top" onClick={() => navigate("/profile")}>
          🔙 Retour au profil
        </button>

        <h2>Modifier le profil</h2>

        <div className="avatar-section">
          <img
            src={previewUrl || "https://via.placeholder.com/100"}
            alt="avatar"
            className="avatar"
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="form-group">
          <label>Nom</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Pays</label>
          <input type="text" name="country" value={form.country} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Ville</label>
          <input type="text" name="city" value={form.city} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Téléphone</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Sexe</label>
          <select name="sexe" value={form.sexe} onChange={handleChange}>
            <option value="">-- Sélectionner --</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date de naissance</label>
          <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} />
        </div>

        <button className="save-button" type="submit">💾 Sauvegarder</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditProfile;
