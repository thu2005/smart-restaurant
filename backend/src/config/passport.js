const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { prisma } = require('./database');
const dotenv = require('dotenv');

dotenv.config();

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

const jwtStrategy = new JwtStrategy(options, async (payload, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
        });

        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
});

const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
    callbackURL: "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // 1. Check if user exists by Google ID
            let user = await prisma.user.findUnique({
                where: { googleId: profile.id }
            });

            if (user) {
                return done(null, user);
            }

            // 2. Check if user exists by Email
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            if (email) {
                user = await prisma.user.findUnique({ where: { email } });
                if (user) {
                    // Link Google ID to existing account
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { googleId: profile.id, emailVerified: true }
                    });
                    return done(null, user);
                }
            }

            // 3. Create new user
            user = await prisma.user.create({
                data: {
                    googleId: profile.id,
                    email: email,
                    fullName: profile.displayName,
                    role: 'CUSTOMER',
                    emailVerified: true,
                    // No password for Google users
                }
            });
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    });

module.exports = {
    jwtStrategy,
    googleStrategy,
};
