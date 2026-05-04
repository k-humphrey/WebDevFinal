const assert = require('node:assert/strict')
const test = require('node:test')

const {
  validateAiInput,
  validateAuthInput,
  validateComponentInput,
  validateProfileInput
} = require('../JS/server/validation')
const { buildRevisionPrompt, htmlToPlainText } = require('../JS/server/services/aiService')

test('auth validation rejects invalid emails and short passwords', () => {
  assert.equal(validateAuthInput({ email: 'bad', password: 'password123' }, 'login').error, 'Enter a valid email address.')
  assert.equal(validateAuthInput({ email: 'test@example.com', password: 'short' }, 'login').error, 'Password must be at least 8 characters.')
})

test('auth validation normalizes email', () => {
  const result = validateAuthInput({ email: 'TEST@Example.com ', password: 'password123' }, 'login')
  assert.equal(result.value.email, 'test@example.com')
})

test('profile validation requires a first and last name', () => {
  assert.equal(validateProfileInput({ firstName: 'Ada' }).error, 'First and last name are required.')
})

test('component validation requires type, title, and content', () => {
  assert.equal(validateComponentInput({ title: 'Developer', content: 'Built things' }).error, 'Choose an ingredient type.')
  assert.equal(validateComponentInput({ typeName: 'Experience', content: 'Built things' }).error, 'Title is required.')
  assert.equal(validateComponentInput({ typeName: 'Experience', title: 'Developer' }).error, 'Add details before saving this ingredient.')
})

test('component validation lets skills use the default skills title', () => {
  const result = validateComponentInput({
    typeName: 'Skills',
    content: '<ul><li>JavaScript</li><li>SQL</li></ul>'
  })

  assert.equal(result.value.title, 'Skills')
  assert.equal(result.value.organization, '')
})

test('ai validation requires enough context', () => {
  assert.equal(
    validateAiInput({ typeName: 'Skills' }).error,
    'Add details or fill out organization, dates, or location before using AI revision.'
  )
})

test('ai validation accepts legacy resume builder field names', () => {
  const result = validateAiInput({
    TypeName: 'Experience',
    InstitutionName: 'Campus Tutor',
    Duties: 'Helped students debug JavaScript forms'
  })

  assert.equal(result.value.typeName, 'Experience')
  assert.equal(result.value.title, 'Campus Tutor')
  assert.equal(result.value.content, 'Helped students debug JavaScript forms')
})

test('ai validation builds context from structured fields when details are empty', () => {
  const result = validateAiInput({
    content: '',
    endDate: '2026',
    location: 'Cookeville',
    occupation: 'Solutions Engineering',
    organization: 'mcdonalds',
    startDate: '2022',
    title: 'cashier',
    typeName: ''
  })

  assert.equal(result.value.typeName, 'Experience')
  assert.equal(result.value.title, 'cashier')
  assert.match(result.value.content, /Organization: mcdonalds/)
  assert.match(result.value.content, /Dates: 2022 to 2026/)
})

test('revision prompt tells the model not to invent facts', () => {
  const prompt = buildRevisionPrompt({
    occupation: 'Frontend Developer',
    typeName: 'Experience',
    title: 'Intern',
    content: 'Helped make pages'
  })

  assert.match(prompt, /Do not invent/)
  assert.match(prompt, /Frontend Developer/)
  assert.match(prompt, /Helped make pages/)
})

test('ai prompt converts quill html to readable plain text', () => {
  assert.equal(htmlToPlainText('<ul><li>JavaScript</li><li>SQL</li></ul>'), '- JavaScript\n- SQL')
})
