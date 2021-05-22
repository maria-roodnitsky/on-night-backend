/* eslint-disable import/prefer-default-export */
import User from '../models/user';

export const createUser = async (postFields) => {
  const user = new User();
  user.firstName = postFields.firstName;
  user.lastName = postFields.lastName;
  user.sex = postFields.sex;
  user.classYear = postFields.classYear;
  user.house = postFields.house;
  user.permission = postFields.permission;

  try {
    const savedUser = await user.save();
    return savedUser;
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
