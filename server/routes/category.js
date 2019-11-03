const express = require('express');
const _ = require('underscore');
const app = express();

const Category = require('../models/category');
const { error } = require('../Utils/utils');
const { tokenVerify, adminRoleVerify } = require('../middlewares/authentication');

app.use(tokenVerify);

app.get('/category', (req, res) =>{
  Category.find({}, 'descripcion')
    .sort('descripcion')
    .populate('user', 'nombre email')
    .exec((err, categories) => {
      if (err) return error(res, err, 400);
      res.json({
        ok: true,
        categories
      });
    });
});

app.get('/category/:id', (req, res) =>{
  const id = req.params.id;
  Category.findById(id, 'descripcion')
    .exec((err, category) => {
      if (err) return error(res, err, 500);
      if (!category) return error(res, {message: "la categoría no existe"}, 400);
      res.json({
        ok: true,
        category
      });
    });
});

app.post('/category', adminRoleVerify, (req, res) => {
  // regresa la nueva categoria
  let body = req.body;
  let userId = req.user._id;

  let category = new Category({
    descripcion: body.descripcion.toLowerCase(),
    user: userId
  })

  console.log(JSON.stringify(category));
  
  category.save((err, categoryDB) => {
    if (err) return error(res, err, 500);
    res.json({
      ok: true,
      category: categoryDB
    });
  });
});

app.put('/category/:id', adminRoleVerify, (req, res) => {
  let id = req.params.id;
  let body = req.body;

  let descripcion = {
    descripcion: body.descripcion.toLowerCase()
  };

  Category.findByIdAndUpdate(id, descripcion, {new: true, runValidators: false}, (err, categoryDB) => {
    if (err) return error(res, err, 500);
    if (!categoryDB) return error(res, err, 400);
  
    res.json({
      ok: true,
      category: categoryDB
    });
  });
});

app.delete('/category/:id', adminRoleVerify, (req, res) => {
  // solo un admin puede borrar
  let id = req.params.id;
  Category.findByIdAndDelete(id, (err, categoryDeleted) => {
    if (err) return error(res, err, 500);
    if (!categoryDB) return error(res, {message: "el id no existe"}, 400);
    res.json({
      ok: true,
      message: "categoria borrada"
    });
  });

});

module.exports = app;