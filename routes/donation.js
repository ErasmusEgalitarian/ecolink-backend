const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation'); // Caminho para o seu modelo

// Rota para criar uma doação
router.post('/', async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Log the incoming request

        const { userId, materialType, description = '', qtdMaterial } = req.body;

        // Criação de uma nova doação
        const donation = new Donation({
            userId,
            materialType,
            description,
            qtdMaterial,
        });

        // Salva no banco de dados
        const savedDonation = await donation.save();
        res.status(201).json(savedDonation);
    } catch (error) {
        res.status(500).json({ message: 'Error saving donation', error });
    }
});

module.exports = router;
