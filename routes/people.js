const express = require('express');
const router = express.Router();

const MovieService = require('../services/movieService');

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate person ID format
        if (!id || !id.match(/^nm\d+$/)) {
            return res.status(400).json({
                error: true,
                message: "Invalid person ID format. Expected format: nm followed by numbers (e.g., nm1234567)"
            });
        }

        const person = await MovieService.getPersonDetails(id);

        if (!person) {
            return res.status(404).json({
                error: true,
                message: "No record exists of a person with this ID"
            });
        }

        res.json(person);

    } catch (error) {
        console.error('Person details error:', error);
        res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

module.exports = router;