const express = require('express');
const crypto = require('crypto');
const { User } = require('../config/db');

const router = express.Router();

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

/**
 * POST /api/auth/register
 * Mendaftarkan akun baru ke MongoDB Atlas
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi',
        error_code: 'VALIDATION_ERROR'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan login.',
        error_code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const combinedHash = `${salt}:${hash}`;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password_hash: combinedHash
    });

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran akun berhasil',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Masuk akun menggunakan email & password
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi',
        error_code: 'VALIDATION_ERROR'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password tidak sesuai',
        error_code: 'INVALID_CREDENTIALS'
      });
    }

    const [salt, storedHash] = user.password_hash.split(':');
    const computedHash = hashPassword(password, salt);

    if (computedHash !== storedHash) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password tidak sesuai',
        error_code: 'INVALID_CREDENTIALS'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Cek status akun aktif
 */
router.get('/me', async (req, res, next) => {
  try {
    const email = req.query.email;
    if (email) {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        return res.status(200).json({
          success: true,
          data: user
        });
      }
    }
    return res.status(200).json({
      success: true,
      data: {
        status: 'guest',
        message: 'Tidak ada sesi aktif'
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
