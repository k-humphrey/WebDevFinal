function cleanString(value, maxLength = 500) {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim().slice(0, maxLength)
}

function firstString(body, names, maxLength = 500) {
  for (const name of names) {
    const value = cleanString(body[name], maxLength)
    if (value) {
      return value
    }
  }

  return ''
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateAuthInput(body, mode) {
  const email = cleanString(body.email, 254).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''

  if (!isValidEmail(email)) {
    return { error: 'Enter a valid email address.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  if (mode === 'register' && password.length > 128) {
    return { error: 'Password must be 128 characters or fewer.' }
  }

  return { value: { email, password } }
}

function validateProfileInput(body) {
  const value = {
    firstName: cleanString(body.firstName || body.FirstName, 80),
    lastName: cleanString(body.lastName || body.LastName, 80),
    email: cleanString(body.email || body.Email, 254).toLowerCase(),
    phoneNumber: cleanString(body.phoneNumber || body.PhoneNumber || body.Phone, 30),
    occupation: cleanString(body.occupation || body.Occupation, 120)
  }

  if (!value.firstName || !value.lastName) {
    return { error: 'First and last name are required.' }
  }

  if (value.email && !isValidEmail(value.email)) {
    return { error: 'Profile email must be valid.' }
  }

  return { value }
}

function validateComponentInput(body) {
  const value = {
    typeName: firstString(body, ['typeName', 'TypeName', 'Type', 'type', 'selectedType'], 80),
    title: firstString(body, ['title', 'Title', 'txtTitle', 'institutionName', 'InstitutionName'], 140),
    organization: firstString(body, ['organization', 'Organization', 'institutionName', 'InstitutionName'], 140),
    startDate: firstString(body, ['startDate', 'StartDate', 'dateStart'], 40),
    endDate: firstString(body, ['endDate', 'EndDate', 'dateEnd'], 40),
    location: firstString(body, ['location', 'Location'], 140),
    content: firstString(body, ['content', 'Content', 'details', 'Details', 'duties', 'Duties', 'relevantCoursework'], 4000)
  }

  if (value.typeName.toLowerCase() === 'skills' && !value.title) {
    value.title = 'Skills'
  }

  if (!value.typeName) {
    return { error: 'Choose an ingredient type.' }
  }

  if (!value.title) {
    return { error: 'Title is required.' }
  }

  if (!value.content) {
    return { error: 'Add details before saving this ingredient.' }
  }

  return { value }
}

function validateAiInput(body) {
  const organization = firstString(body, ['organization', 'Organization', 'institutionName', 'InstitutionName'], 140)
  const startDate = firstString(body, ['startDate', 'StartDate', 'dateStart'], 40)
  const endDate = firstString(body, ['endDate', 'EndDate', 'dateEnd'], 40)
  const location = firstString(body, ['location', 'Location'], 140)

  const value = {
    typeName: firstString(body, ['typeName', 'TypeName', 'Type', 'type', 'selectedType'], 80),
    title: firstString(body, ['title', 'Title', 'txtTitle', 'institutionName', 'InstitutionName'], 140),
    organization,
    startDate,
    endDate,
    location,
    occupation: firstString(body, ['occupation', 'Occupation'], 120),
    content: firstString(body, ['content', 'Content', 'details', 'Details', 'duties', 'Duties', 'relevantCoursework'], 4000)
  }

  if (!value.typeName) {
    value.typeName = inferTypeName(value)
  }

  if (!value.content) {
    value.content = buildAiContextFromFields(value)
  }

  const isSkills = value.typeName.toLowerCase() === 'skills'

  if (!isSkills && !value.title) {
    return { error: 'Title is required for AI revision.' }
  }

  if (!value.content) {
    return { error: 'Add details or fill out organization, dates, or location before using AI revision.' }
  }

  if (isSkills && !value.title) {
    value.title = 'Skills'
  }

  if (!value.title) {
    return { error: 'Title is required for AI revision.' }
  }

  return { value }
}

function inferTypeName(value) {
  const combined = `${value.title} ${value.organization}`.toLowerCase()

  if (combined.match(/school|college|university|degree|gpa|course/)) {
    return 'Education'
  }

  if (combined.match(/project|portfolio|app|website/)) {
    return 'Project'
  }

  if (combined.match(/skill|tool|language|framework/)) {
    return 'Skills'
  }

  return 'Experience'
}

function buildAiContextFromFields(value) {
  const lines = [
    value.title ? `Role or title: ${value.title}` : '',
    value.organization ? `Organization: ${value.organization}` : '',
    value.location ? `Location: ${value.location}` : '',
    value.startDate || value.endDate ? `Dates: ${value.startDate || 'Unknown'} to ${value.endDate || 'Present'}` : '',
    value.occupation ? `Target job: ${value.occupation}` : ''
  ].filter(Boolean)

  return lines.join('\n')
}

module.exports = {
  buildAiContextFromFields,
  cleanString,
  firstString,
  inferTypeName,
  validateAiInput,
  validateAuthInput,
  validateComponentInput,
  validateProfileInput
}
