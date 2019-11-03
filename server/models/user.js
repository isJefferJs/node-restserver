const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let validRoles = {
  values: ['ADMIN_ROLE','USER_ROLE'],
  message: '{VALUE} no es un rol válido'
}

let userSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'El email es obligatorio']
  },
  password: {
    type: String,
    required: [true, 'El password es obligatorio']
  },
  img: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: validRoles,
    default: 'USER_ROLE'
  },
  estado: {
    type: Boolean,
    default: true
  },
  google: {
    type: Boolean,
    default: false
  }
});

userSchema.plugin(uniqueValidator, {message: '{PATH} debe de ser único.'});

userSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;

  return userObject;
}

module.exports = mongoose.model('User', userSchema);