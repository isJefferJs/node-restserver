const jwt = require('jsonwebtoken');

let tokenVerify = (req, res, next) => {
  let token = req.get('token');

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err
      })
    }

    req.user = decoded.user;
    next();
  });
}

let adminRoleVerify = (req, res, next) => {
  let user = req.user;
  let paramId = req.params.id;
  
  console.log(user.role);
  if (user.role !== "ADMIN_ROLE") {
    return res.status(401).json({
      ok: false,
      err: "No es posible ejecutar esta acción, necesita permisos de administrador."
    });
  }

  if (user["_id"] === paramId) {
    return res.status(401).json({
      ok: false,
      err: "Admin, No puedes eliminar tu propio user."
    });
  }

  next();
}

module.exports = {
  tokenVerify,
  adminRoleVerify
}