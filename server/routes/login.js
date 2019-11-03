const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { error } = require('../Utils/utils');

// Google SignIn
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const User = require('../models/user');

const app = express();

app.post('/login', (req, res) => {
  let body = req.body;
  let email = body.email;

  User.findOne({ email }, (err, userDB) => {
    if (err) return error(res, err, 500);

    if (!userDB
      || !bcrypt.compareSync(body.password, userDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario o contraseña incorrectos.'
        }
      })
    }

    let token = jwt.sign({
      user: userDB
    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN});

    res.json({
      ok: true,
      user: userDB,
      token
    });
  });
});


// Configuraciones de Google

async function verify( token ) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }
}

app.post('/GoogleSignIn', async (req, res) => {
  let token = req.body.idtoken;

  let googleUser = await verify(token)
    .catch(err => {
      return error(res, err, 403);
    });

  User.findOne({ email: googleUser.email }, (err, userDB) => {
    if (err) return error(res, err, 500);

    if (userDB) {
      
      if (userDB.google === false) {
        return error(res, { message: "Usuario no autenticado con google" }, 400);
      } else {
        let token = jwt.sign({
          user: userDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN});

        res.json({
          ok: true,
          user: userDB,
          token
        })
      }
    } else {
      let user = new User();
      user.nombre = googleUser.nombre;
      user.email = googleUser.email;
      user.img = googleUser.img;
      user.google = googleUser.google;
      user.password = 'se pone cualquier cosa para pasar la validacion';

      user.save((err, userDB) => {
        if (err) return error(res, err, 500);

        let token = jwt.sign({
          user: userDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN});

        res.json({
          ok: true,
          user: userDB,
          token
        });
      });
    }
  });
});

module.exports = app;