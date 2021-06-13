/* eslint linebreak-style: ["error", "windows"] */
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';

import User from '../models/user';

// loads in .env file if needed
dotenv.config({ silent: true });

// options for local strategy, we'll use email AS the username
// not have separate ones
const localOptions = { usernameField: 'email' };

// options for jwt strategy
// we'll pass in the jwt in an `authorization` header
// so passport can find it there
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.AUTH_SECRET,
};
// NOTE: we are not calling this a bearer token (although it technically is), if you see people use Bearer in front of token on the internet you could either ignore it, use it but then you have to parse it out here as well as prepend it on the frontend.

// username/email + password authentication strategy
const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
  let user;
  let isMatch;

  try {
    user = await User.findOne({ email });
    if (!user) {
      // if no user with the given email is found
      return done(null, false);
    }
    isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // if user with email is found, but password is incorrect
      return done(null, false);
    } else {
      // if given email/password successfully matches with a user in the system
      return done(null, user);
    }
  } catch (error) {
    return done(error);
  }
});

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  let user;
  try {
    user = await User.findById(payload.sub);
  } catch (error) {
    // handles error with findById method
    done(error, false);
  }
  if (user) {
    // success: when userID in payload successfully corresponds to a user in the system
    done(null, user);
  } else {
    // fail: if findById function returns null object
    done(null, false);
  }
});

// Tell passport to use this strategy
passport.use(jwtLogin); // for 'jwt'
passport.use(localLogin); // for 'local'

// middleware functions to use in routes
export const requireAuth = passport.authenticate('jwt', { session: false });
export const requireSignin = passport.authenticate('local', { session: false });
