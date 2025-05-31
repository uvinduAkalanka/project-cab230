const express = require('express');
const router = express.Router();

const UserService = require('../services/userService');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

router.get('/:email/profile', optionalAuth, async (req, res) => {
    try {
        const { email } = req.params;
        const requestingUser = req.user; // Set by optionalAuth middleware

        // Find the user whose profile is being requested
        const user = await UserService.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "User not found"
            });
        }

        const isOwnProfile = requestingUser && requestingUser.email === email;

        if (isOwnProfile) {
            res.json({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                dob: user.dob,
                address: user.address
            });
        } else {
            // Public view - return only basic information
            res.json({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            });
        }

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

router.put('/:email/profile', authenticateToken, async (req, res) => {
    try {
        const { email } = req.params;
        const requestingUser = req.user;
        const { firstName, lastName, dob, address } = req.body;

        if (requestingUser.email !== email) {
            return res.status(403).json({
                error: true,
                message: "Forbidden"
            });
        }

        if (firstName === undefined || lastName === undefined || dob === undefined || address === undefined) {
            return res.status(400).json({
                error: true,
                message: "Request body incomplete: firstName, lastName, dob and address are required"
            });
        }

        if (typeof firstName !== 'string' || typeof lastName !== 'string' ||
            typeof dob !== 'string' || typeof address !== 'string') {
            return res.status(400).json({
                error: true,
                message: "Request body invalid: firstName, lastName, dob and address must be strings only"
            });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dob)) {
            return res.status(400).json({
                error: true,
                message: "Invalid input: dob must be a real date in format YYYY-MM-DD"
            });
        }

        const date = new Date(dob);
        if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dob) {
            return res.status(400).json({
                error: true,
                message: "Invalid input: dob must be a real date in format YYYY-MM-DD"
            });
        }

        const user = await UserService.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "User not found"
            });
        }

        const updatedUser = await UserService.updateUserProfile(email, {
            firstName,
            lastName,
            dob,
            address
        });

        res.json({
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            dob: updatedUser.dob,
            address: updatedUser.address
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
});

module.exports = router;