var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es necesario']
  },
  precioUni: {
    type: Number,
    required: [true, 'El precio únitario es necesario']
  },
  descripcion: {
    type: String,
    required: false
  },
  img: {
    type: String,
    required: false
  },
  disponible: {
    type: Boolean,
    required: true,
    default: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);
