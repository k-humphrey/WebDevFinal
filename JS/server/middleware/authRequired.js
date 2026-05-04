const { getUserBySessionToken } = require('../services/authService')

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie || ''
  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim())
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`))

  if (!target) {
    return ''
  }

  return decodeURIComponent(target.slice(name.length + 1))
}

async function authRequired(req, res, next) {
  try {
    const token = readCookie(req, 'sweet_session')
    const user = await getUserBySessionToken(token)

    if (!user) {
      res.status(401).json({ outcome: 'error', message: 'Sign in to continue.' })
      return
    }

    req.sessionToken = token
    req.user = user
    next()
  } catch (err) {
    console.error('Auth middleware failed:', err)
    res.status(500).json({ outcome: 'error', message: 'Authentication failed.' })
  }
}

module.exports = {
  authRequired,
  readCookie
}
