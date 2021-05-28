/* eslint-disable import/prefer-default-export */
import jwt from 'jwt-simple';
import dotenv from 'dotenv';
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
  user.firstName = postFields.firstName;
  user.lastName = postFields.lastName;
  user.sex = postFields.sex;
  user.classYear = postFields.classYear;
  user.house = postFields.house;
  user.permission = postFields.permission;
  user.email = postFields.email;
  user.password = postFields.password;

  try {
    await user.save();
    return tokenForUser(user);
  } catch (error) {
    throw new Error(`create user error: ${error}`);
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
