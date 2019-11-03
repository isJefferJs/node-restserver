const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { error } = require('../Utils/utils');
const app = express();

const User = require('../models/user');
const Product = require('../models/product');

app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:type/:id', function(req, res) {
  let id = req.params.id;
  let type = req.params.type;
  let validTypes = ['products', 'users'];
  if (validTypes.indexOf( type ) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: `Tipo inválido. Tipos válidos: ${validTypes.join(', ')}`
      }
    })
  }
  
  if (Object.keys(req.files).length == 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "no se ha seleccionado ningún archivo"
      }
    })
  }

  let file = req.files.file;
  let filename = file.name.split('.');
  let extension = filename[filename.length - 1];
  let validExtensions = ['png', 'jpg', 'gif', 'jpeg']

  if (validExtensions.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: `archivo con extensión inválida. Extensiones válidas ${validExtensions.join(', ')}`
      }
    })
  }

  let fileNameModified = `${id}_${ new Date().getMilliseconds() }.${extension}`;

  file.mv(`./uploads/${type}/${fileNameModified}`, function(err) {
    if (err)
      return res.status(500).json({
        ok: false,
        err
      })
      
    if (type === 'users') {
      userImage(id, res, fileNameModified);
    }  

    if (type === 'products') {
      productImage(id, res, fileNameModified);
    }

  });
});

function productImage(id, res, fileNameModified) {
  Product.findById(id, (err, productDB) => {
    if (err) {
      deleteFile(fileNameModified, 'products');
      return error(res, err, 500);
    }

    if(!productDB) {
      deleteFile(fileNameModified, 'products');
      return error(res, {message: 'El producto no existe'}, 400);
    }

    deleteFile(productDB.img, 'products');

    productDB.img = fileNameModified;
    console.log(productDB);
    productDB.save((err, productSaved) => {
      res.json({
        ok: true,
        product: productSaved,
        img: fileNameModified
      });
    });
  });
}

function userImage(id, res, fileNameModified) {
  User.findById(id, (err, userDB) => {
    if (err) {
      deleteFile(fileNameModified, 'users');
      return error(res, err, 500);
    }

    if(!userDB) {
      deleteFile(fileNameModified, 'users');
      return error(res, {message: 'Usuario no existe'}, 400);
    }

    deleteFile(userDB.img, 'users');

    userDB.img = fileNameModified;
    userDB.save((err, userSaved) => {
      res.json({
        ok: true,
        user: userSaved,
        img: fileNameModified
      });
    });
  });
}

function deleteFile(filename, type) {

  let pathImg = path.resolve(__dirname, `../../uploads/${type}/${filename}`);  
  if (fs.existsSync(pathImg)) {
    fs.unlinkSync(pathImg);
  }
}


module.exports = app;