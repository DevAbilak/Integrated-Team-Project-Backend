const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User-model.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          // Create a new user with a random password (since they'll use Google)
          const randomPassword = crypto.randomBytes(32).toString("hex");
          user = await User.create({
            email,
            name: profile.displayName,
            password: randomPassword,
            emailVerified: true, // Google emails are already verified
            googleId: profile.id,
          });
        } else {
          // Optionally update googleId if not set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        }

        // Create JWT payload
        const payload = {
          id: user._id,
          email: user.email,
          name: user.name,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        return done(null, { token, user: payload });
      } catch (error) {
        console.error(error);
        return done(error, null);
      }
    },
  ),
);
