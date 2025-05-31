const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import configurations
const db = require('./config/database');
const { swaggerUi, swaggerDocument, swaggerOptions } = require('./config/swagger');

// Import authentication utilities
const JWTUtils = require('./utils/jwt');
const PasswordUtils = require('./utils/password');
const UserService = require('./services/userService');

// Import routes
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');
const peopleRoutes = require('./routes/people');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation on root route
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerDocument, swaggerOptions));

// API Routes
app.use('/user', userRoutes);
app.use('/user', profileRoutes);
app.use('/movies', movieRoutes);
app.use('/people', peopleRoutes);

// Basic route to test server
app.get('/test', (req, res) => {
    res.json({
        message: 'Server is running!',
        database: 'Connected',
        timestamp: new Date().toISOString()
    });
});

// Test database connection route
app.get('/test-db', async (req, res) => {
    try {
        // Test if we can query the movies database
        const result = await db('basics').limit(1);

        const userCount = await db('users').count('* as count').first();

        res.json({
            message: 'Database connection successful',
            moviesTableTest: result.length > 0 ? 'Success' : 'No data',
            usersTableTest: 'Connected',
            userCount: userCount.count
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Database connection failed',
            details: error.message
        });
    }
});

// Test authentication system
app.get('/test-auth', async (req, res) => {
    try {
        // Test password hashing
        const testPassword = 'testpassword123';
        const hashedPassword = await PasswordUtils.hashPassword(testPassword);
        const passwordMatch = await PasswordUtils.comparePassword(testPassword, hashedPassword);

        // Test JWT token generation
        const testPayload = { id: 1, email: 'test@example.com' };
        const accessToken = JWTUtils.generateAccessToken(testPayload, 60); // 1 minute
        const refreshToken = JWTUtils.generateRefreshToken(testPayload, 120); // 2 minutes

        // Test token verification
        const decodedAccess = JWTUtils.verifyToken(accessToken);
        const decodedRefresh = JWTUtils.verifyToken(refreshToken);

        // Test email validation
        const emailTest = PasswordUtils.validateEmail('test@example.com');
        const passwordTest = PasswordUtils.validatePassword('testpassword123');

        res.json({
            message: 'Authentication system test successful',
            tests: {
                passwordHashing: passwordMatch ? 'Success' : 'Failed',
                jwtGeneration: 'Success',
                jwtVerification: {
                    accessToken: decodedAccess.email === testPayload.email ? 'Success' : 'Failed',
                    refreshToken: decodedRefresh.email === testPayload.email ? 'Success' : 'Failed'
                },
                validation: {
                    email: emailTest.isValid ? 'Success' : 'Failed',
                    password: passwordTest.isValid ? 'Success' : 'Failed'
                }
            },
            tokenInfo: {
                accessTokenExpiry: '60 seconds',
                refreshTokenExpiry: '120 seconds',
                accessTokenLength: accessToken.length,
                refreshTokenLength: refreshToken.length
            }
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Authentication test failed',
            details: error.message
        });
    }
});

app.get('/test-user-service', async (req, res) => {
    try {
        const testEmail = 'testuser@example.com';
        const testPassword = 'testpassword123';

        let user = await UserService.findUserByEmail(testEmail);

        if (!user) {
            user = await UserService.createUser(testEmail, testPassword);
            res.json({
                message: 'User service test successful',
                action: 'Created new test user',
                user: {
                    id: user.id,
                    email: user.email,
                    created: true
                }
            });
        } else {
            // Test authentication
            const authenticatedUser = await UserService.authenticateUser(testEmail, testPassword);
            res.json({
                message: 'User service test successful',
                action: 'Found and authenticated existing user',
                user: {
                    id: authenticatedUser.id,
                    email: authenticatedUser.email,
                    created: false
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'User service test failed',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: true,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/`);
    console.log(`Test routes:`);
    console.log(`- http://localhost:${PORT}/test`);
    console.log(`- http://localhost:${PORT}/test-db`);
    console.log(`- http://localhost:${PORT}/test-auth`);
    console.log(`- http://localhost:${PORT}/test-user-service`);
});

module.exports = app;
