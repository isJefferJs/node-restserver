// =====================
// PUERTO
// =====================
process.env.PORT = process.env.PORT || 3000;

// =====================
// ENTORNO
// =====================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =====================
// Base de datos
// =====================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
  urlDB = 'mongodb://localhost:27017/cafe';
} else {
  urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// =====================
// Expiración del token
// =====================
process.env.CADUCIDAD_TOKEN = 1000 * 60 * 60 * 24 * 31;

// =====================
// Seed
// =====================
process.env.SEED = process.env.SEED || '-seed-para-desarrollo-onetec-';

// =====================
// Google Client ID
// =====================
process.env.CLIENT_ID = process.env.CLIENT_ID || '1067428872466-qtv818997p5cp6rka67110mdli2a4cvj.apps.googleusercontent.com';