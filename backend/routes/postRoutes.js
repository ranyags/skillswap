const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // dossier pour les fichiers

router.post("/create", verifyToken, upload.single("code"), async (req, res) => {
  const { title, description } = req.body;
  const code_file_path = req.file ? req.file.path : null;

  try {
    await pool.query(
      "INSERT INTO posts (user_id, title, description, code_file_path) VALUES (?, ?, ?, ?)",
      [req.user.id, title, description, code_file_path]
    );
    res.status(201).json({ message: "Publication créée avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.get("/", async (req, res) => {
    try {
      const [posts] = await pool.query(
        "SELECT posts.*, users.name AS author FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC"
      );
      res.json(posts);
    } catch (error) {
      console.error("Erreur récupération des publications :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  