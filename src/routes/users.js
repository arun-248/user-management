const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const DB = require('../db');
const {
  ensurePresentKeys,
  normalizeMobile,
  validatePAN,
  isUUIDv4,
  validateFullName
} = require('../utils/validators');

const router = express.Router();

// helper: format user rows
function mapUserRow(row) {
  return {
    user_id: row.user_id,
    full_name: row.full_name,
    mob_num: row.mob_num,
    pan_num: row.pan_num,
    manager_id: row.manager_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_active: !!row.is_active
  };
}

// validate manager exists + active
function assertActiveManagerOrThrow(manager_id) {
  const m = DB.stmts.isManagerActive.get(manager_id);
  if (!m) {
    const err = new Error(`manager_id not found: ${manager_id}`);
    err.status = 400;
    throw err;
  }
  if (m.is_active !== 1) {
    const err = new Error(`manager_id is not active: ${manager_id}`);
    err.status = 400;
    throw err;
  }
}

// 1.1 Create User
router.post('/create_user', (req, res, next) => {
  try {
    const required = ['full_name', 'mob_num', 'pan_num', 'manager_id'];
    const missing = ensurePresentKeys(req.body, required);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing keys: ${missing.join(', ')}` });
    }

    const full_name = validateFullName(req.body.full_name);
    if (!full_name) return res.status(400).json({ success: false, message: 'full_name must not be empty' });

    const mob_num = normalizeMobile(req.body.mob_num);
    if (!mob_num) return res.status(400).json({ success: false, message: 'mob_num must be valid 10-digit number' });

    const pan_num = validatePAN(req.body.pan_num);
    if (!pan_num) return res.status(400).json({ success: false, message: 'pan_num must be valid (ABCDE1234F)' });

    const manager_id = String(req.body.manager_id);
    if (!isUUIDv4(manager_id)) return res.status(400).json({ success: false, message: 'manager_id must be UUID v4' });
    assertActiveManagerOrThrow(manager_id);

    // prevent duplicate active mob_num
    const existActive = DB.stmts.getUsersByMob.all(mob_num).some(u => u.is_active === 1);
    if (existActive) {
      return res.status(409).json({ success: false, message: 'User with this mobile already exists' });
    }

    const user = {
      user_id: uuidv4(),
      full_name,
      mob_num,
      pan_num,
      manager_id,
      created_at: DB.nowISO(),
      updated_at: DB.nowISO(),
      is_active: 1
    };

    DB.stmts.insertUser.run(user);
    logger.info('User created', { user_id: user.user_id });

    return res.json({ success: true, message: 'User created', user_id: user.user_id });
  } catch (err) {
    return next(err);
  }
});

// 1.2 Get Users
router.post('/get_users', (req, res, next) => {
  try {
    const { user_id, mob_num, manager_id } = req.body || {};

    if (!user_id && !mob_num && !manager_id) {
      const rows = DB.stmts.getAllUsers.all().map(mapUserRow);
      return res.json({ success: true, users: rows });
    }
    if (user_id) {
      if (!isUUIDv4(user_id)) return res.status(400).json({ success: false, message: 'user_id invalid UUID' });
      const row = DB.stmts.getUserById.get(user_id);
      return res.json({ success: true, users: row ? [mapUserRow(row)] : [] });
    }
    if (mob_num) {
      const norm = normalizeMobile(mob_num);
      if (!norm) return res.status(400).json({ success: false, message: 'mob_num invalid' });
      const rows = DB.stmts.getUsersByMob.all(norm).map(mapUserRow);
      return res.json({ success: true, users: rows });
    }
    if (manager_id) {
      if (!isUUIDv4(manager_id)) return res.status(400).json({ success: false, message: 'manager_id invalid UUID' });
      const rows = DB.stmts.getUsersByManager.all(manager_id).map(mapUserRow);
      return res.json({ success: true, users: rows });
    }

    return res.json({ success: true, users: [] });
  } catch (err) {
    return next(err);
  }
});

// 1.3 Delete User
router.post('/delete_user', (req, res, next) => {
  try {
    const { user_id, mob_num } = req.body || {};
    if (!user_id && !mob_num) {
      return res.status(400).json({ success: false, message: 'Need user_id or mob_num' });
    }
    if (user_id) {
      if (!isUUIDv4(user_id)) return res.status(400).json({ success: false, message: 'user_id invalid UUID' });
      const row = DB.stmts.getUserById.get(user_id);
      if (!row) return res.status(404).json({ success: false, message: 'User not found' });
      DB.stmts.deleteUserById.run(user_id);
      return res.json({ success: true, message: 'User deleted' });
    }
    if (mob_num) {
      const norm = normalizeMobile(mob_num);
      if (!norm) return res.status(400).json({ success: false, message: 'mob_num invalid' });
      const matches = DB.stmts.getUsersByMob.all(norm);
      if (matches.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
      if (matches.length > 1) return res.status(409).json({ success: false, message: 'Multiple users found, use user_id' });
      DB.stmts.deleteUserByMob.run(norm);
      return res.json({ success: true, message: 'User deleted' });
    }
  } catch (err) {
    return next(err);
  }
});

// 1.4 Update User
router.post('/update_user', (req, res, next) => {
  try {
    const missing = ensurePresentKeys(req.body, ['user_ids', 'update_data']);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing: ${missing.join(', ')}` });
    }

    let user_ids = req.body.user_ids;
    if (typeof user_ids === 'string') user_ids = [user_ids];
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'user_ids must be non-empty array' });
    }

    const update_data = req.body.update_data || {};
    const allowedKeys = ['full_name', 'mob_num', 'pan_num', 'manager_id'];
    for (const key of Object.keys(update_data)) {
      if (!allowedKeys.includes(key)) {
        return res.status(400).json({ success: false, message: `Invalid key ${key}` });
      }
    }

    // Validate
    if (update_data.full_name) {
      update_data.full_name = validateFullName(update_data.full_name);
      if (!update_data.full_name) return res.status(400).json({ success: false, message: 'full_name invalid' });
    }
    if (update_data.mob_num) {
      update_data.mob_num = normalizeMobile(update_data.mob_num);
      if (!update_data.mob_num) return res.status(400).json({ success: false, message: 'mob_num invalid' });
    }
    if (update_data.pan_num) {
      update_data.pan_num = validatePAN(update_data.pan_num);
      if (!update_data.pan_num) return res.status(400).json({ success: false, message: 'pan_num invalid' });
    }
    if (update_data.manager_id) {
      if (!isUUIDv4(update_data.manager_id)) return res.status(400).json({ success: false, message: 'manager_id invalid UUID' });
      assertActiveManagerOrThrow(update_data.manager_id);
    }

    // Perform updates
    const trx = DB.db.transaction(() => {
      for (const id of user_ids) {
        if (!isUUIDv4(id)) throw new Error(`Invalid UUID: ${id}`);
        const existing = DB.stmts.getUserById.get(id);
        if (!existing) throw new Error(`User not found: ${id}`);
        const updated = {
          user_id: id,
          full_name: update_data.full_name ?? existing.full_name,
          mob_num: update_data.mob_num ?? existing.mob_num,
          pan_num: update_data.pan_num ?? existing.pan_num,
          manager_id: update_data.manager_id ?? existing.manager_id,
          updated_at: DB.nowISO()
        };
        DB.stmts.updateUserFull.run(updated);
      }
    });
    trx();

    return res.json({ success: true, message: 'Update successful' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
