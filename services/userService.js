const db = require('../config/database');
const PasswordUtils = require('../utils/password');
const JWTUtils = require('../utils/jwt');

class UserService {

    static async createUser(email, password) {
        // Validate email and password
        const emailValidation = PasswordUtils.validateEmail(email);
        if (!emailValidation.isValid) {
            throw new Error(emailValidation.errors.join(', '));
        }

        const passwordValidation = PasswordUtils.validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        const existingUser = await this.findUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await PasswordUtils.hashPassword(password);

        const [userId] = await db('users').insert({
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        return await this.findUserById(userId);
    }

    static async findUserByEmail(email) {
        const user = await db('users')
            .where('email', email.toLowerCase().trim())
            .first();

        return user || null;
    }

    static async findUserById(id) {
        const user = await db('users')
            .select('id', 'email', 'firstName', 'lastName', 'dob', 'address', 'created_at', 'updated_at')
            .where('id', id)
            .first();

        return user || null;
    }

    static async authenticateUser(email, password) {
        const user = await this.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await PasswordUtils.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async updateUserProfile(email, profileData) {
        const { firstName, lastName, dob, address } = profileData;

        // Validate input
        if (firstName !== null && typeof firstName !== 'string') {
            throw new Error('firstName must be a string');
        }
        if (lastName !== null && typeof lastName !== 'string') {
            throw new Error('lastName must be a string');
        }
        if (dob !== null && typeof dob !== 'string') {
            throw new Error('dob must be a string');
        }
        if (address !== null && typeof address !== 'string') {
            throw new Error('address must be a string');
        }

        if (dob !== null && dob !== undefined) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dob)) {
                throw new Error('Invalid input: dob must be a real date in format YYYY-MM-DD');
            }

            const date = new Date(dob);
            if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dob) {
                throw new Error('Invalid input: dob must be a real date in format YYYY-MM-DD');
            }
        }

        const user = await this.findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        await db('users')
            .where('email', email)
            .update({
                firstName,
                lastName,
                dob,
                address,
                updated_at: new Date()
            });

        return await this.findUserById(user.id);
    }


    static async storeRefreshToken(token, userId, expiresAt) {
        await db('refresh_tokens').insert({
            token,
            user_id: userId,
            expires_at: expiresAt
        });
    }


    static async findRefreshToken(token) {
        return await db('refresh_tokens')
            .where('token', token)
            .where('expires_at', '>', new Date())
            .first();
    }

    static async deleteRefreshToken(token) {
        await db('refresh_tokens')
            .where('token', token)
            .del();
    }

    static async deleteAllRefreshTokensForUser(userId) {
        await db('refresh_tokens')
            .where('user_id', userId)
            .del();
    }

    static async cleanupExpiredTokens() {
        await db('refresh_tokens')
            .where('expires_at', '<', new Date())
            .del();
    }
}

module.exports = UserService;