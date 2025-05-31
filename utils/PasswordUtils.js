// const bcrypt = require('bcrypt');
//
// class PasswordUtils {
//
//     /**
//      * Hash a password using bcrypt
//      * @param {string} password - Plain text password
//      * @returns {Promise<string>} Hashed password
//      */
//     static async hashPassword(password) {
//         const saltRounds = 12; // Good balance of security and performance
//         return await bcrypt.hash(password, saltRounds);
//     }
//
//     /**
//      * Compare a plain text password with a hashed password
//      * @param {string} plainPassword - Plain text password
//      * @param {string} hashedPassword - Hashed password from database
//      * @returns {Promise<boolean>} True if passwords match
//      */
//     static async comparePassword(plainPassword, hashedPassword) {
//         return await bcrypt.compare(plainPassword, hashedPassword);
//     }
//
//     /**
//      * Validate password requirements
//      * @param {string} password - Password to validate
//      * @returns {Object} Validation result with isValid and errors
//      */
//     static validatePassword(password) {
//         const errors = [];
//
//         if (!password) {
//             errors.push('Password is required');
//             return { isValid: false, errors };
//         }
//
//         if (typeof password !== 'string') {
//             errors.push('Password must be a string');
//             return { isValid: false, errors };
//         }
//
//         if (password.length < 6) {
//             errors.push('Password must be at least 6 characters long');
//         }
//
//         if (password.length > 128) {
//             errors.push('Password must be less than 128 characters');
//         }
//
//         return {
//             isValid: errors.length === 0,
//             errors
//         };
//     }
//
//     /**
//      * Validate email format
//      * @param {string} email - Email to validate
//      * @returns {Object} Validation result with isValid and errors
//      */
//     static validateEmail(email) {
//         const errors = [];
//
//         if (!email) {
//             errors.push('Email is required');
//             return { isValid: false, errors };
//         }
//
//         if (typeof email !== 'string') {
//             errors.push('Email must be a string');
//             return { isValid: false, errors };
//         }
//
//         // Basic email regex pattern
//         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//
//         if (!emailPattern.test(email)) {
//             errors.push('Email must be a valid email address');
//         }
//
//         if (email.length > 255) {
//             errors.push('Email must be less than 255 characters');
//         }
//
//         return {
//             isValid: errors.length === 0,
//             errors
//         };
//     }
// }
//
// module.exports = PasswordUtils;