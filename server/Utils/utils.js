const error = (res, err, status = 200) => {
  return res.status(status).json({
    ok: false,
    err
  })
}

module.exports = {
  error
}