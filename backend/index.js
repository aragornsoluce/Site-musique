const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const morgan  = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuration Multer pour stocker dans /uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- Middleware
app.use(morgan('dev'));       // logs des requêtes
app.use(express.json());

// --- Route POST /upload
app.post('/upload', upload.single('music'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu.' });
  }
  res.json({ message: 'Fichier uploadé !', filename: req.file.filename });
});

// --- Route GET /musics (liste des fichiers)
app.get('/musics', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Impossible de lister les fichiers.' });
    res.json(files);
  });
});

// --- Route GET /download/:filename
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier non trouvé.' });
  }
  res.download(filePath);
});

// --- Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
