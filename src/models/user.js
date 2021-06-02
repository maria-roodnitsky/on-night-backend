import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  name: String,
  sex: String,
  classYear: Number,
  house: String,
  permission: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  // for account activation, note that 'activationString' is a JWT
  activated: Boolean,
  activationString: String,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

UserSchema.pre('save', async function beforeUserSave(next) {
  // get access to the user model
  const user = this;

  if (!user.isModified('password')) return next();

  try {
    // salt, hash, then set password to hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

// note use of named function rather than arrow notation
UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  const comparison = await bcrypt.compare(candidatePassword, this.password);
  return comparison;
};

// create model class
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
