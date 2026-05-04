const path = require('path')
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const resumeRoutes = require('./routes/resumeRoutes')
const { authRequired } = require('./middleware/authRequired')
const { updateProfile } = require('./services/authService')
const { validateProfileInput } = require('./validation')

function createApp() {
  const app = express()

  app.use(express.json({ limit: '1mb' }))
  app.use(cors({ origin: true, credentials: true }))

  app.use('/CSS', express.static(path.join(__dirname, '..', '..', 'CSS')))
  app.use('/HTML', express.static(path.join(__dirname, '..', '..', 'HTML')))
  app.use('/JS', express.static(path.join(__dirname, '..', '..', 'JS')))
  app.use('/node_modules', express.static(path.join(__dirname, '..', '..', 'node_modules')))

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'HTML', 'index.html'))
  })

  app.use('/api/auth', authRoutes)
  app.use('/api', resumeRoutes)

  // Compatibility route for the original frontend while the UI is being migrated.
  app.post('/api/saveBasic', authRequired, async (req, res) => {
    const validation = validateProfileInput(req.body)
    if (validation.error) {
      res.status(400).json({ outcome: 'error', message: validation.error })
      return
    }

    try {
      const user = await updateProfile(req.user.id, validation.value)
      res.status(200).json({ outcome: 'success', user })
    } catch (err) {
      console.error('Basic profile save failed:', err)
      res.status(500).json({ outcome: 'error', message: 'Could not save profile.' })
    }
  })

  app.use((req, res) => {
    res.status(404).json({ outcome: 'error', message: 'Route not found.' })
  })

  app.use((err, req, res, next) => {
    console.error('Unhandled request error:', err)
    res.status(500).json({ outcome: 'error', message: 'Unexpected server error.' })
  })

  return app
}

module.exports = {
  createApp
}
