const crypto = require('crypto')
const { get, run } = require('../db')

const SESSION_DAYS = 7

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, storedHash) {
  const [salt, expected] = String(storedHash).split(':')
  if (!salt || !expected) {
    return false
  }

  const actual = crypto.scryptSync(password, salt, 64)
  const expectedBuffer = Buffer.from(expected, 'hex')

  return expectedBuffer.length === actual.length && crypto.timingSafeEqual(actual, expectedBuffer)
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString()

  await run('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [
    userId,
    tokenHash,
    expiresAt
  ])

  return { token, expiresAt }
}

async function registerUser(email, password) {
  const existing = await get('SELECT id FROM users WHERE email = ?', [email])
  if (existing) {
    return { error: 'An account already exists for that email.' }
  }

  const passwordHash = hashPassword(password)
  const result = await run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash])
  const session = await createSession(result.id)
  const user = await getPublicUserById(result.id)

  return { user, session }
}

async function loginUser(email, password) {
  const userRow = await get('SELECT * FROM users WHERE email = ?', [email])
  if (!userRow || !verifyPassword(password, userRow.password_hash)) {
    return { error: 'Email or password is incorrect.' }
  }

  await run('DELETE FROM sessions WHERE expires_at <= datetime("now")')
  const session = await createSession(userRow.id)
  const user = toPublicUser(userRow)

  return { user, session }
}

async function getUserBySessionToken(token) {
  if (!token) {
    return null
  }

  const tokenHash = hashToken(token)
  const row = await get(
    `SELECT users.*
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ? AND sessions.expires_at > datetime('now')`,
    [tokenHash]
  )

  return row ? toPublicUser(row) : null
}

async function logout(token) {
  if (!token) {
    return
  }
  await run('DELETE FROM sessions WHERE token_hash = ?', [hashToken(token)])
}

async function updateProfile(userId, profile) {
  await run(
    `UPDATE users
     SET first_name = ?, last_name = ?, phone_number = ?, occupation = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [profile.firstName, profile.lastName, profile.phoneNumber, profile.occupation, userId]
  )

  return getPublicUserById(userId)
}

async function getPublicUserById(userId) {
  const row = await get('SELECT * FROM users WHERE id = ?', [userId])
  return row ? toPublicUser(row) : null
}

function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phoneNumber: row.phone_number,
    occupation: row.occupation
  }
}

module.exports = {
  getUserBySessionToken,
  loginUser,
  logout,
  registerUser,
  updateProfile
}
