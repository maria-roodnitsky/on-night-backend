/* eslint-disable import/prefer-default-export */
/* eslint linebreak-style: ["error", "windows"] */
import User from '../models/user';

export const getUsers = async () => {
  const users = await User.find();

  try {
    return users;
  } catch (error) {
    throw new Error(`get all users error: ${error}`);
  }
};
