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
  // for resetting passwords, note that resettingPasswordCode is a randomly generated numerical code
  resettingPassword: Boolean,
  resettingPasswordCode: String,
  // for account activation, note that 'activationString' is a JWT
  activated: Boolean,
  activationString: String,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

// middleware that salts + hashes passwords before saving them to the database
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

UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  const comparison = await bcrypt.compare(candidatePassword, this.password);
  return comparison;
};

// create model class
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
