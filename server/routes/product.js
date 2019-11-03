const express = require('express');
const _ = require('underscore');
const { error } = require('../Utils/utils');
const { tokenVerify, adminRoleVerify } = require('../middlewares/authentication');
const app = express();

const Product = require('../models/product');

app.use(tokenVerify);

//  1. obtener productos, listar usuario y categoría, paginado.
app.get('/product', (req, res) => {
  let from = Number(req.query.from) || 0;
  let until = Number(req.query.until) || 7;

  Product.find({ disponible: true })
    .skip(from)
    .limit(until)
    .populate('user', 'nombre email')
    .populate('category', 'descripcion')
    .exec((err, products) => {
      if (err) return error(res, err, 400);
      Product.countDocuments({ disponible: true }, (err, count) => {
        res.json({
          ok:true,
          products,
          count
        });
      });
    });
});

//  2. Obtener un producto por ID, listar usuario y categoría
app.get('/product/:id', (req, res) => {
    let id = req.params.id;

    Product.find({ _id: id, disponible: true}, 'nombre precioUni descripcion categoria usuario')
      .populate('category')
      .populate('user', 'nombre email')
      .exec((err, product) => {
        if (err) return error(res, err, 500);
        if (!product) return error(res, {message: "Producto no encontrado"}, 400);
        res.json({
          ok:true,
          product
        });
      });
});

// extra: buscar productos
app.get('/product/search/:termino', (req, res) => {
  let termino = req.params.termino;

  let regex = new RegExp(termino, 'i');
  Product.find({ disponible: true, nombre: regex })
    .populate('category', 'nombre')
    .exec((err, products) => {
      if (err) return error(res, err, 500);
      Product.countDocuments({ disponible: true, nombre: regex }, (err, count) => {
        res.json({
          ok:true,
          count,
          products
        });
      });
    });
});

//  3. Crear un nuevo producto, grabarle el usuario y una categoría del listado.
app.post('/product', (req, res) => {
  let body = req.body;
  let userId = req.user._id;

  let product = new Product({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    category: body.categoria,
    user: userId
  });

  product.save((err, productBD) => {
    if (err) return error(res, err, 500);
    // status 201 para cuando se crea un nuevo registro
    res.status(201).json({
      ok: true,
      product: productBD
    });
  });
});

//  4. Actualizar producto.
app.put('/product/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick( req.body, ['nombre', 'precioUni', 'descripcion'] );

  Product.findByIdAndUpdate(id, body, {new: true}, (err, productDB) => {
    if (err) return error(res, err, 400);
    if (!productDB) return error(res, {message: "el producto no existe"}, 400);
    res.json({
      ok: true,
      product: productDB
    })
  });
});

//  5. borrar producto de manera lógica.
app.delete('/product/:id', (req, res) => {
  let id = req.params.id;
  let changeState = {
    disponible: false
  };

  Product.findByIdAndUpdate(id, changeState, { new: true }, (err, product) => {
    if (err) return error(res, err, 400);
    if (!product) return error(res, { message: "Producto no encontrado" })
    res.json({
      ok: true,
      product
    });
  });
});

module.exports = app;