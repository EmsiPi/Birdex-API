// routes/birds.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Bird = require('../modele/schema_bird');
const multer = require('multer');
const fs = require('fs');
const path = require('path');





//Config du stockage pour les images 

const storage = multer.diskStorage({
    destination: (req, file, im) => {
        im(null, 'images/');
    },
    filename: (req, file, im) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        im(null, uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

//lire tous les oiseaux
router.get("/", async (req, res) => {
    const birds = await Bird.find();
    console.log(birds)
    res.json(birds);
});

//ajouter un oiseau
router.post('/', upload.single('image'), async (req, res) => {
    console.log("Fichier reçu :", req.file);
    console.log("Corps reçu :", req.body);
    try {
        const birdData = new Bird({
            name: req.body.name,
            location: req.body.location,
            date: req.body.date,
        });

        if (req.file) {
            birdData.urlImage = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        }
        const bird = new Bird(birdData);

        const savedBird = await bird.save();
        res.status(201).json(savedBird);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//delete un oiseau trouvé par son Id
router.delete("/:id", async (req, res) => {
    try {
        const deletedBird = await Bird.findByIdAndDelete(req.params.id);

        if (!deletedBird) {
            return res.status(404).json({ error: "Oiseau non trouvé" });
        }


        //supprimer le fichier physiquement
        if (deletedBird.urlImage) {
            const filename = deletedBird.urlImage.split('/images/')[1];

            fs.unlink(`images/${filename}`, (err) => {
                if (err) {
                    console.error("Erreur lors de la suppression du fichier physique:", err);
                } else {
                    console.log("Fichier image supprimé avec succès");
                }
            });
        }

        res.status(200).json({
            message: "Oiseau supprimé",
            bird: deletedBird
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
)

//montrer un oiseau trouvé par son Id
router.get("/:id", async (req, res) => {
    try {
        const bird = await Bird.findById(req.params.id);

        if (!bird) {
            return res.status(404).json({ error: "Oiseau non trouvé" });
        }

        res.status(200).json(bird);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.patch("/:id", upload.single('image'), async (req, res) => {
    try {
        let updateData = { ...req.body };
        const birdToUp = await Bird.findById(req.params.id);

        if (!birdToUp) {
            return res.status(404).json({ error: "Oiseau non trouvé" });
        }

        if (req.file) {

            const filename = birdToUp.urlImage.split('/images/')[1];

            fs.unlink(`images/${filename}`, (err) => {
                if (err) {
                    console.error("Erreur lors de la suppression du fichier physique:", err);
                } else {
                    console.log("Fichier image supprimé avec succès");
                }
            });
            updateData.urlImage = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        }

        const updatedBird = await Bird.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!updatedBird) {
            return res.status(404).json({ error: "Oiseau non trouvé" });
        }

        res.status(200).json(updatedBird);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});





module.exports = router;