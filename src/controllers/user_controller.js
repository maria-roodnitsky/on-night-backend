/* eslint-disable import/prefer-default-export */
import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import { customAlphabet } from 'nanoid';
import bcrypt from 'bcryptjs';
import User from '../models/user';

dotenv.config({ silent: true });

export const signin = (user) => {
  return tokenForUser(user);
};

export const signup = async (postFields) => {
  if (!postFields.email || !postFields.password) {
    throw new Error('You must provide at least an email and password!');
  }

  // See if a user with the given email exists
  const existingUser = await User.findOne({ email: postFields.email });
  if (existingUser) {
    // If a user with email does exist, return an error
    throw new Error('Email is in use');
  }

  const user = new User();
  user.name = postFields.name;
  user.sex = postFields.sex;
  user.classYear = postFields.classYear;
  user.house = postFields.house;
  user.permission = postFields.permission;
  user.email = postFields.email;
  user.password = postFields.password;
  user.resettingPassword = false;
  user.resettingPasswordCode = '';
  user.activated = false;
  user.activationString = '';

  try {
    await user.save();
    const token = tokenForUser(user);
    await User.findOneAndUpdate({ email: postFields.email }, { activationString: token });
    return token;
  } catch (error) {
    throw new Error(`create user error: ${error}`);
  }
};

export const activateUser = async (email, token) => {
  try {
    await User.findOneAndUpdate({ email, activationString: token }, { activated: true });
  } catch (error) {
    throw new Error(`could not activate user: ${error}`);
  }
};

export const userIsResettingPassword = async (email) => {
  try {
    const nanoid = customAlphabet('1234567890', 10);
    const resetCode = nanoid();
    const user = await User.findOne({ email });
    await User.findOneAndUpdate({ email }, { resettingPasswordCode: resetCode });
    return { resetCode, userid: user._id };
  } catch (error) {
    throw new Error(`could not set resettingPasswordCode to a short code: ${error}`);
  }
};

export const checkPasswordResetCode = async (email, parsedCode) => {
  try {
    const user = await User.findOne({ email });
    if (user.resettingPasswordCode === parsedCode) {
      await User.findOneAndUpdate({ email }, { resettingPassword: true });
      return { resettingPassword: true, userid: user._id };
    } else {
      return { resettingPassword: false, userid: user._id };
    }
  } catch (error) {
    throw new Error('could not check if password-reset codes were the same on backend and from parsed URL');
  }
};

export const getUser = async (id) => {
  const user = await User.findById(id);

  try {
    return user;
  } catch (error) {
    throw new Error(`could not get user error: ${error}`);
  }
};

export const updateUser = async (id, putFields) => {
  if (putFields.password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(putFields.password, salt);
    putFields.password = hash;
  }
  await User.findByIdAndUpdate(id, { resettingPassword: false, resettingPasswordCode: '' });
  await User.findByIdAndUpdate(id, putFields);
};

export const getUsers = async () => {
  const users = await User.find();

  try {
    return users;
  } catch (error) {
    throw new Error(`get all users error: ${error}`);
  }
};

// encodes a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}
