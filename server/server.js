require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const mongoose = require('mongoose');

// fix deprecation warning
mongoose.set('useFindAndModify', false);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

// Configuración global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB,
  { useNewUrlParser: true, useCreateIndex: true },
  (err, res) => {
  if (err) throw err;
  console.log('base de datos ONLINE');
})
.catch(err => {
  return console.log('Error al conectar con la BD');
});

app.listen(process.env.PORT, () => {
  console.log(`escuchando puerto ${process.env.PORT}`)
})
