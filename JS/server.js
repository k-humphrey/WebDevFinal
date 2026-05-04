const { createApp } = require('./server/app')
const { initializeDatabase } = require('./server/db')

const PORT = Number(process.env.PORT || 8000)

async function startServer() {
  try {
    await initializeDatabase()
    const app = createApp()

    app.listen(PORT, () => {
      console.log(`Sweet Resumes listening on port: ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start Sweet Resumes:', err)
    process.exit(1)
  }
}

startServer()
