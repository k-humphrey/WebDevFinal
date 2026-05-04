const express = require('express')
const { loginUser, logout, registerUser, updateProfile } = require('../services/authService')
const { authRequired } = require('../middleware/authRequired')
const { validateAuthInput, validateProfileInput } = require('../validation')

const router = express.Router()

router.post('/register', async (req, res) => {
  const validation = validateAuthInput(req.body, 'register')
  if (validation.error) {
    res.status(400).json({ outcome: 'error', message: validation.error })
    return
  }

  try {
    const result = await registerUser(validation.value.email, validation.value.password)
    if (result.error) {
      res.status(409).json({ outcome: 'error', message: result.error })
      return
    }

    setSessionCookie(res, result.session.token, result.session.expiresAt)
    res.status(201).json({ outcome: 'success', user: result.user })
  } catch (err) {
    console.error('Registration failed:', err)
    res.status(500).json({ outcome: 'error', message: 'Could not create account.' })
  }
})

router.post('/login', async (req, res) => {
  const validation = validateAuthInput(req.body, 'login')
  if (validation.error) {
    res.status(400).json({ outcome: 'error', message: validation.error })
    return
  }

  try {
    const result = await loginUser(validation.value.email, validation.value.password)
    if (result.error) {
      res.status(401).json({ outcome: 'error', message: result.error })
      return
    }

    setSessionCookie(res, result.session.token, result.session.expiresAt)
    res.status(200).json({ outcome: 'success', user: result.user })
  } catch (err) {
    console.error('Login failed:', err)
    res.status(500).json({ outcome: 'error', message: 'Could not sign in.' })
  }
})

router.post('/logout', authRequired, async (req, res) => {
  try {
    await logout(req.sessionToken)
    res.setHeader('Set-Cookie', 'sweet_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
    res.status(200).json({ outcome: 'success' })
  } catch (err) {
    console.error('Logout failed:', err)
    res.status(500).json({ outcome: 'error', message: 'Could not sign out.' })
  }
})

router.get('/me', authRequired, (req, res) => {
  res.status(200).json({ outcome: 'success', user: req.user })
})

router.put('/profile', authRequired, async (req, res) => {
  const validation = validateProfileInput(req.body)
  if (validation.error) {
    res.status(400).json({ outcome: 'error', message: validation.error })
    return
  }

  try {
    const user = await updateProfile(req.user.id, validation.value)
    res.status(200).json({ outcome: 'success', user })
  } catch (err) {
    console.error('Profile update failed:', err)
    res.status(500).json({ outcome: 'error', message: 'Could not save profile.' })
  }
})

function setSessionCookie(res, token, expiresAt) {
  const maxAge = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  res.setHeader(
    'Set-Cookie',
    `sweet_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`
  )
}

module.exports = router
