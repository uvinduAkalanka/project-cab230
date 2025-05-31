// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
//
// class JWTUtils {
//
//     /**
//      * Generate an access token (bearer token)
//      * @param {Object} payload - User data to include in token
//      * @param {number} expiresIn - Expiration time in seconds (default from env)
//      * @returns {string} JWT token
//      */
//     static generateAccessToken(payload, expiresIn = null) {
//         const expiry = expiresIn || parseInt(process.env.JWT_EXPIRES_IN) || 600; // 10 minutes default
//
//         return jwt.sign(
//             {
//                 ...payload,
//                 type: 'access'
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: expiry,
//                 issuer: 'cab230-movie-api',
//                 audience: 'cab230-users'
//             }
//         );
//     }
//
//     /**
//      * Generate a refresh token
//      * @param {Object} payload - User data to include in token
//      * @param {number} expiresIn - Expiration time in seconds (default from env)
//      * @returns {string} JWT refresh token
//      */
//     static generateRefreshToken(payload, expiresIn = null) {
//         const expiry = expiresIn || parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 86400; // 24 hours default
//
//         return jwt.sign(
//             {
//                 ...payload,
//                 type: 'refresh',
//                 jti: crypto.randomUUID() // Unique token ID
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: expiry,
//                 issuer: 'cab230-movie-api',
//                 audience: 'cab230-users'
//             }
//         );
//     }
//
//     /**
//      * Verify and decode a JWT token
//      * @param {string} token - JWT token to verify
//      * @returns {Object} Decoded token payload
//      * @throws {Error} If token is invalid or expired
//      */
//     static verifyToken(token) {
//         try {
//             return jwt.verify(token, process.env.JWT_SECRET, {
//                 issuer: 'cab230-movie-api',
//                 audience: 'cab230-users'
//             });
//         } catch (error) {
//             if (error.name === 'TokenExpiredError') {
//                 const decodedError = new Error('JWT token has expired');
//                 decodedError.name = 'TokenExpiredError';
//                 throw decodedError;
//             } else if (error.name === 'JsonWebTokenError') {
//                 const decodedError = new Error('Invalid JWT token');
//                 decodedError.name = 'JsonWebTokenError';
//                 throw decodedError;
//             }
//             throw error;
//         }
//     }
//
//     /**
//      * Extract token from Authorization header
//      * @param {string} authHeader - Authorization header value
//      * @returns {string|null} Extracted token or null
//      */
//     static extractTokenFromHeader(authHeader) {
//         if (!authHeader) {
//             return null;
//         }
//
//         const parts = authHeader.split(' ');
//         if (parts.length !== 2 || parts[0] !== 'Bearer') {
//             return null;
//         }
//
//         return parts[1];
//     }
//
//     /**
//      * Get token expiration date
//      * @param {number} expiresIn - Expiration time in seconds
//      * @returns {Date} Expiration date
//      */
//     static getExpirationDate(expiresIn) {
//         return new Date(Date.now() + (expiresIn * 1000));
//     }
// }
//
// module.exports = JWTUtils;