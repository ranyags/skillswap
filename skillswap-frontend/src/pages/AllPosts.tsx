import { useState, useEffect } from "react";
import axios from "axios";

interface Post {
  id: number;
  title: string;
  description: string;
  code_file_path: string;
  author: string;
}

const AllPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/posts")
      .then(res => setPosts(res.data))
      .catch(err => console.error("Erreur chargement posts", err));
  }, []);

  const handleDownload = (path: string) => {
    window.open(`http://localhost:5000/${path}`, "_blank");
  };

  return (
    <div className="all-posts-page">
      <h2>📂 Projets publiés</h2>
      {posts.length === 0 ? (
        <p>Aucun projet trouvé.</p>
      ) : (
        <ul className="posts-list">
          {posts.map(post => (
            <li key={post.id} className="post-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <p><strong>Auteur :</strong> {post.author}</p>
              <button onClick={() => handleDownload(post.code_file_path)}>
                ⬇️ Télécharger le code
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllPosts;
