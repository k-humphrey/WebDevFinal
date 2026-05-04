const express = require('express')
const { authRequired } = require('../middleware/authRequired')
const { validateAiInput, validateComponentInput } = require('../validation')
const { createComponent, deleteComponent, listComponents, listTypes } = require('../services/componentService')
const { reviseResumeContent } = require('../services/aiService')

const router = express.Router()

router.get('/types', async (req, res) => {
  try {
    const types = await listTypes()
    res.status(200).json({ outcome: 'success', message: types })
  } catch (err) {
    console.error('Type lookup failed:', err)
    res.status(500).json({ outcome: 'error', message: 'Could not load ingredient types.' })
  }
})

router.get('/components', authRequired, async (req, res) => {
  try {
    const components = await listComponents(req.user.id)
    res.status(200).json({ outcome: 'success', components })
  } catch (err) {
    console.error('Component list failed:', err)
    res.status(500).json({ outcome: 'error', message: 'Could not load ingredients.' })
  }
})

router.post('/components', authRequired, async (req, res) => {
  const validation = validateComponentInput(req.body)
  if (validation.error) {
    res.status(400).json({ outcome: 'error', message: validation.error })
    return
  }

  try {
    const component = await createComponent(req.user.id, validation.value)
    res.status(201).json({ outcome: 'success', component })
  } catch (err) {
    console.error('Component save failed:', err)
    res.status(500).json({ outcome: 'error', message: 'Could not save ingredient.' })
  }
})

router.delete('/components/:id', authRequired, async (req, res) => {
  const componentId = Number(req.params.id)
  if (!Number.isInteger(componentId) || componentId <= 0) {
    res.status(400).json({ outcome: 'error', message: 'Component id must be a positive number.' })
    return
  }

  try {
    const deleted = await deleteComponent(req.user.id, componentId)
    if (!deleted) {
      res.status(404).json({ outcome: 'error', message: 'Ingredient not found.' })
      return
    }

    res.status(200).json({ outcome: 'success' })
  } catch (err) {
    console.error('Component delete failed:', err)
    res.status(500).json({ outcome: 'error', message: 'Could not delete ingredient.' })
  }
})

router.post('/revise-component', authRequired, async (req, res) => {
  const validation = validateAiInput(req.body)
  if (validation.error) {
    console.warn('AI revision validation failed:', {
      receivedFields: Object.keys(req.body || {}),
      userId: req.user.id
    })
    res.status(400).json({ outcome: 'error', message: validation.error })
    return
  }

  try {
    const revisedContent = await reviseResumeContent(validation.value)
    res.status(200).json({ outcome: 'success', revisedContent })
  } catch (err) {
    console.error('AI revision failed:', err)
    res.status(err.statusCode || 500).json({
      outcome: 'error',
      message: err.statusCode === 503 ? err.message : 'Could not revise ingredient with AI.'
    })
  }
})

module.exports = router
