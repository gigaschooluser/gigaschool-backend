// Fichier : index.js (version pour Render)

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Render utilise des variables d'environnement directement
const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;

if (!uri) {
  console.error("ERREUR : La variable d'environnement MONGODB_URI est manquante !");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connecté à MongoDB Atlas !");

    const database = client.db("gigaschool");
    const coursesCollection = database.collection("courses");

    app.get('/api/courses/:levelId', async (req, res) => {
      const courses = await coursesCollection.find({ levelId: req.params.levelId }).sort({ createdAt: -1 }).toArray();
      res.json(courses);
    });

    app.post('/api/courses', async (req, res) => {
      const courseDocument = { ...req.body, createdAt: new Date() };
      const result = await coursesCollection.insertOne(courseDocument);
      res.status(201).json(result);
    });

    app.listen(port, () => {
      console.log(`Serveur démarré sur le port ${port}`);
    });

  } catch (err) {
    console.error("Échec de la connexion à MongoDB", err);
  }
}

run();
