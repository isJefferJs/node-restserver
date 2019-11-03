const express = require('express');
const app = express();

app.use(require("./login"));
app.use(require("./user"));
app.use(require("./category"));

// ./product  tiene el middleware que verifica el token siempre,
// también aplicará para los siguientes por estar después.
app.use(require("./product"));
app.use(require("./upload"));
app.use(require("./imagenes"));

module.exports = app;