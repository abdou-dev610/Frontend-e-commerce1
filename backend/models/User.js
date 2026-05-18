import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  fullName: String,
  phone: String,
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware: Hasher le password avant de sauvegarder
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode: Comparer le password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

// Méthode: Retourner les données publiques (sans password)
userSchema.methods.toPublic = function() {
  return {
    id: this._id,
    email: this.email,
    fullName: this.fullName,
    phone: this.phone,
    isAdmin: this.isAdmin,
    emailVerified: this.emailVerified
  };
};

export default mongoose.model('User', userSchema);
