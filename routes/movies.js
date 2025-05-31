const express = require('express');
const router = express.Router();

const MovieService = require('../services/movieService');

router.get('/search', async (req, res) => {
    try {
        const { title, year, page } = req.query;

        // Validate page parameter
        const pageNum = page ? parseInt(page) : 1;
        if (pageNum < 1 || isNaN(pageNum)) {
            return res.status(400).json({
                error: true,
                message: "Invalid page number. Page must be a positive integer."
            });
        }

        let yearNum = null;
        if (year) {
            yearNum = parseInt(year);
            if (isNaN(yearNum) || yearNum < 1800 || yearNum > new Date().getFullYear() + 5) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid year. Year must be between 1800 and current year + 5."
                });
            }
        }

        const results = await MovieService.searchMovies({
            title: title?.trim(),
            year: yearNum,
            page: pageNum
        });

        res.json(results);

    } catch (error) {
        console.error('Movie search error:', error);
        res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

router.get('/data/:imdbID', async (req, res) => {
    try {
        const { imdbID } = req.params;

        // Validate IMDB ID format
        if (!imdbID || !imdbID.match(/^tt\d+$/)) {
            return res.status(400).json({
                error: true,
                message: "Invalid IMDB ID format. Expected format: tt followed by numbers (e.g., tt1234567)"
            });
        }

        const movie = await MovieService.getMovieDetails(imdbID);

        if (!movie) {
            return res.status(404).json({
                error: true,
                message: "No record exists of a movie with this ID"
            });
        }

        res.json(movie);

    } catch (error) {
        console.error('Movie details error:', error);
        res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

module.exports = router;