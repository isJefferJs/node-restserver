const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { tokenVerify, adminRoleVerify } = require('../middlewares/authentication')
const User = require('../models/user');
const app = express();


app.get('/users', tokenVerify, (req, res) => {
  
  let from = Number(req.query.from) || 0;
  let until = Number(req.query.until) || 5;

  // primer parámetro: condiciones, segundo parámetro, campos que se quieren
  User.find({ estado: true }, 'nombre email estado role google img')
    .skip(from)
    .limit(until)
    .exec((err, users) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }

      User.countDocuments({ estado: true }, (err, count) => {
        res.json({
          ok: true,
          users,
          count
        });
      });
    });
});

app.post('/users', [tokenVerify, adminRoleVerify], (req, res) => {
  let body = req.body;

  let user = new User({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  });

  // method save return err o el usuario almacenado en BD.
  user.save((err, userDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      })
    }

    res.json({
      ok: true,
      user: userDB
    })
  });
});

app.put('/users/:id', [tokenVerify, adminRoleVerify], (req, res) => {
  let id = req.params.id;
  let body = _.pick( req.body, ['nombre', 'email', 'img', 'role', 'estado'] );
  // let body = req.body;

  User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      user: userDB
    });
  });
});

app.delete('/users/:id', [tokenVerify, adminRoleVerify], (req, res) => {
  let id = req.params.id;
  let changeState = {
    estado: false
  };

  User.findByIdAndUpdate(id, changeState, { new: true }, (err, user) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    if (!user) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario no encontrado"
        }
      });
    } 
    
    res.json({
      ok: true,
      user
    });
  });
});

module.exports = app;