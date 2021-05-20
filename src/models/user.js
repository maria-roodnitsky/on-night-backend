import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  sex: String,
  classYear: Number,
  house: String,
  permission: String,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create model class
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
