import { useState } from "react";
import axios from "axios";

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("code", file);

    const token = localStorage.getItem("token");

    await axios.post("http://localhost:5000/api/posts/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Publication envoyée avec succès !");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Titre du projet" onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Description" onChange={(e) => setDescription(e.target.value)} required />
      <input type="file" accept=".zip,.js,.ts,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button type="submit">Publier</button>
    </form>
  );
};

export default AddPost;
