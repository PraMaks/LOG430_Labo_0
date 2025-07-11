const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { 
        type: String, 
        enum: ['admin', 'seller', 'buyer'], 
        default: 'buyer' 
    },
  stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
  rank: { type: Number }
}, {
  collection: 'utilisateurs',
  timestamps: true
});

// Middleware pour hacher le mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Méthode pour comparer un mot de passe en clair
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
