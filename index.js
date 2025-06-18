// Fichier : index.js (version corrigée pour le développement local)

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

// ===============================================================
// LIGNE AJOUTÉE : Cette instruction est cruciale pour lire votre fichier .env localement.
require('dotenv').config();
// ===============================================================

const app = express();
app.use(cors());
app.use(express.json());

// Cette ligne va maintenant trouver la variable car dotenv l'a chargée
const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;

if (!uri) {
  console.error("ERREUR : La variable d'environnement MONGODB_URI est manquante !");
  console.error("Vérifiez que vous avez bien un fichier .env avec votre clé à la racine du projet backend.");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connecté à MongoDB Atlas !");
    
    const database = client.db("gigaschool");
    const coursesCollection = database.collection("courses");
    
    // Route pour récupérer TOUS les cours
    app.get('/api/courses', async (req, res) => {
      const courses = await coursesCollection.find({}).sort({ createdAt: -1 }).toArray();
      res.json(courses);
    });

    // Route pour récupérer les cours d'un niveau spécifique
    app.get('/api/courses/:levelId', async (req, res) => {
      const courses = await coursesCollection.find({ levelId: req.params.levelId }).sort({ createdAt: -1 }).toArray();
      res.json(courses);
    });

    // Route pour ajouter un cours
    app.post('/api/courses', async (req, res) => {
      const courseDocument = { ...req.body, createdAt: new Date() };
      const result = await coursesCollection.insertOne(courseDocument);
      res.status(201).json(result);
    });
    
    // Route pour supprimer un cours par son ID
    app.delete('/api/courses/:id', async (req, res) => {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de cours invalide." });
        }
        const result = await coursesCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Cours non trouvé." });
        }
        res.status(200).json({ message: "Cours supprimé avec succès." });
    });


    app.listen(port, () => {
      console.log(`Serveur démarré sur le port ${port}`);
    });

  } catch (err) {
    console.error("Échec de la connexion à MongoDB. Vérifiez votre chaîne de connexion dans le fichier .env.", err);
  }
}

run();
