const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categorySchema = new Schema({
  descripcion: {
    type: String, 
    unique: true, 
    required: [true, 'la descripcion es obligatoria']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

categorySchema.plugin(uniqueValidator, {message: '{PATH} debe de ser único.'});

categorySchema.methods.toJSON = function () {
  let category = this;
  let categoryObject = category.toObject();

  return categoryObject;
}

module.exports = mongoose.model('Category', categorySchema);