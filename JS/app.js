const state = {
  user: null,
  components: [],
  selectedComponentIds: new Set(),
  types: [],
  quill: null
}

const views = {
  landing: document.getElementById('divLandingPage'),
  auth: document.getElementById('divAuthPage'),
  builder: document.getElementById('divResumeBuilder'),
  viewer: document.getElementById('divResumeViewer')
}

const statusMessage = document.getElementById('appStatus')

document.addEventListener('DOMContentLoaded', () => {
  bindNavigation()
  bindAuth()
  bindBuilder()
  loadCurrentUser()
})

function bindNavigation() {
  document.getElementById('btnStart').addEventListener('click', () => {
    showView(state.user ? 'builder' : 'auth')
  })

  document.getElementById('btnHome').addEventListener('click', () => showView('landing'))
  document.getElementById('btnMaker').addEventListener('click', () => requireAuthView('builder'))
  document.getElementById('btnViewer').addEventListener('click', () => requireAuthView('viewer'))
  document.getElementById('btnPrintResume').addEventListener('click', () => window.print())
}

function bindAuth() {
  document.getElementById('frmAuth').addEventListener('submit', (event) => {
    event.preventDefault()

    const form = event.currentTarget
    const mode = document.querySelector('input[name="authMode"]:checked').value

    apiFetch(`/api/auth/${mode}`, {
      method: 'POST',
      body: {
        email: form.email.value,
        password: form.password.value
      }
    })
      .then((data) => {
        state.user = data.user
        updateUserUi()
        setStatus(`Signed in as ${state.user.email}.`)
        showView('builder')
        return Promise.all([loadTypes(), loadComponents()])
      })
      .catch(showError)
  })

  document.getElementById('btnLogout').addEventListener('click', () => {
    apiFetch('/api/auth/logout', { method: 'POST' })
      .then(() => {
        state.user = null
        state.components = []
        state.selectedComponentIds.clear()
        updateUserUi()
        renderComponents()
        renderResumePreview()
        showView('landing')
        setStatus('Signed out.')
      })
      .catch(showError)
  })
}

function bindBuilder() {
  initializeRichTextEditor()

  document.getElementById('frmBasics').addEventListener('submit', (event) => {
    event.preventDefault()
    const form = event.currentTarget

    apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: state.user.email,
        phoneNumber: form.phoneNumber.value,
        occupation: form.occupation.value
      }
    })
      .then((data) => {
        state.user = data.user
        updateUserUi()
        setStatus('Basic information saved.')
      })
      .catch(showError)
  })

  document.getElementById('frmComponent').addEventListener('submit', (event) => {
    event.preventDefault()
    saveComponent()
  })

  document.getElementById('btnReviseComponent').addEventListener('click', reviseComponent)
  document.getElementById('selType').addEventListener('change', updateComponentFieldsForType)
  document.getElementById('componentList').addEventListener('change', handleComponentSelection)
  document.getElementById('componentList').addEventListener('click', handleComponentDelete)
}

function loadCurrentUser() {
  apiFetch('/api/auth/me')
    .then((data) => {
      state.user = data.user
      updateUserUi()
      return Promise.all([loadTypes(), loadComponents()])
    })
    .then(() => {
      renderResumePreview()
    })
    .catch(() => {
      updateUserUi()
      showView('landing')
    })
}

function loadTypes() {
  return apiFetch('/api/types').then((data) => {
    state.types = data.message
    const select = document.getElementById('selType')
    select.innerHTML = '<option value="">Choose a type</option>'
    state.types.forEach((type) => {
      const option = document.createElement('option')
      option.value = type.typeName
      option.textContent = type.typeName
      select.appendChild(option)
    })
  })
}

function loadComponents() {
  return apiFetch('/api/components').then((data) => {
    state.components = data.components
    syncSelectedComponents()
    renderComponents()
    renderResumePreview()
  })
}

function saveComponent() {
  const form = document.getElementById('frmComponent')

  apiFetch('/api/components', {
    method: 'POST',
    body: readComponentForm(form)
  })
    .then((data) => {
      state.components.unshift(data.component)
      state.selectedComponentIds.add(data.component.id)
      form.reset()
      setEditorHtml('')
      updateComponentFieldsForType()
      renderComponents()
      renderResumePreview()
      setStatus('Ingredient saved.')
    })
    .catch(showError)
}

function deleteComponent(componentId) {
  apiFetch(`/api/components/${componentId}`, { method: 'DELETE' })
    .then(() => {
      state.components = state.components.filter((component) => component.id !== componentId)
      state.selectedComponentIds.delete(componentId)
      renderComponents()
      renderResumePreview()
      setStatus('Ingredient deleted.')
    })
    .catch(showError)
}

function reviseComponent() {
  const form = document.getElementById('frmComponent')
  const button = document.getElementById('btnReviseComponent')
  const payload = readComponentForm(form)

  button.disabled = true
  button.textContent = 'Revising...'

  apiFetch('/api/revise-component', {
    method: 'POST',
    body: {
      ...payload,
      occupation: state.user ? state.user.occupation : ''
    }
  })
    .then((data) => {
      setEditorHtml(textToHtml(data.revisedContent))
      setStatus('AI revision added. Review it before saving.')
    })
    .catch(showError)
    .finally(() => {
      button.disabled = false
      button.textContent = 'Revise with AI'
    })
}

function readComponentForm(form) {
  const formData = new FormData(form)
  const typeName = getFormValue(formData, 'typeName')
  const isSkills = typeName.toLowerCase() === 'skills'
  const content = getEditorContent()

  return {
    typeName,
    title: isSkills ? 'Skills' : getFormValue(formData, 'title'),
    organization: isSkills ? '' : getFormValue(formData, 'organization'),
    startDate: isSkills ? '' : getFormValue(formData, 'startDate'),
    endDate: isSkills ? '' : getFormValue(formData, 'endDate'),
    location: isSkills ? '' : getFormValue(formData, 'location'),
    content
  }
}

function getFormValue(formData, name) {
  return String(formData.get(name) || '').trim()
}

function renderComponents() {
  const list = document.getElementById('componentList')

  if (!state.components.length) {
    list.innerHTML = '<p class="rounded border border-dashed border-rose-200 bg-white p-4 text-sm text-gray-600">No ingredients saved yet.</p>'
    return
  }

  list.innerHTML = state.components
    .map((component) => {
      const isSelected = state.selectedComponentIds.has(component.id)
      return `
        <article class="rounded border border-rose-200 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <label class="flex min-w-0 items-start gap-3">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                data-component-select="${component.id}"
                ${isSelected ? 'checked' : ''}
              >
              <span class="min-w-0">
                <span class="block font-semibold text-primary">${escapeHtml(component.title)}</span>
                <span class="block text-xs uppercase tracking-wide text-gray-500">${escapeHtml(component.typeName)}</span>
              </span>
            </label>
            <button
              type="button"
              class="shrink-0 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
              data-component-delete="${component.id}"
            >
              Delete
            </button>
          </div>
          ${component.typeName === 'Skills' ? '' : `<p class="text-sm text-gray-700">${escapeHtml(component.organization || component.location || '')}</p>`}
          <div class="rich-text-content mt-2 text-sm text-gray-800">${sanitizeRichText(component.content)}</div>
        </article>
      `
    })
    .join('')
}

function renderResumePreview() {
  const preview = document.getElementById('resumePreview')
  const viewerPreview = document.getElementById('resumeViewerPreview')
  const user = state.user || {}
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Your Name'
  const contact = [user.email, user.phoneNumber].filter(Boolean).join(' | ')

  const html = `
    <section class="mx-auto max-w-3xl bg-white p-8 text-left text-gray-900 shadow-sm print:shadow-none">
      <header class="border-b border-gray-300 pb-4">
        <h1 class="text-3xl font-bold">${escapeHtml(fullName)}</h1>
        <p class="text-sm">${escapeHtml(contact)}</p>
        <p class="text-sm font-medium">${escapeHtml(user.occupation || '')}</p>
      </header>
      <main class="mt-5 space-y-5">
        ${renderPreviewGroups()}
      </main>
    </section>
  `

  preview.innerHTML = html
  viewerPreview.innerHTML = html
}

function renderPreviewGroups() {
  const selectedComponents = state.components.filter((component) => state.selectedComponentIds.has(component.id))

  if (!state.components.length) {
    return '<p class="text-sm text-gray-600">Saved ingredients will appear here.</p>'
  }

  if (!selectedComponents.length) {
    return '<p class="text-sm text-gray-600">Select ingredients to include them in this resume.</p>'
  }

  const groups = selectedComponents.reduce((memo, component) => {
    memo[component.typeName] = memo[component.typeName] || []
    memo[component.typeName].push(component)
    return memo
  }, {})

  return Object.entries(groups)
    .map(([typeName, components]) => {
      const items = components
        .map((component) => {
          const meta = [component.organization, component.location, component.startDate, component.endDate]
            .filter(Boolean)
            .join(' | ')

          return `
            <article>
              <h3 class="font-semibold">${escapeHtml(component.title)}</h3>
              <p class="text-xs text-gray-600">${escapeHtml(meta)}</p>
              <div class="rich-text-content mt-1 text-sm">${sanitizeRichText(component.content)}</div>
            </article>
          `
        })
        .join('')

      return `
        <section>
          <h2 class="mb-2 border-b border-gray-200 text-sm font-bold uppercase tracking-wide">${escapeHtml(typeName)}</h2>
          <div class="space-y-3">${items}</div>
        </section>
      `
    })
    .join('')
}

function syncSelectedComponents() {
  const loadedIds = new Set(state.components.map((component) => component.id))

  if (!state.selectedComponentIds.size) {
    state.components.forEach((component) => state.selectedComponentIds.add(component.id))
    return
  }

  state.selectedComponentIds.forEach((id) => {
    if (!loadedIds.has(id)) {
      state.selectedComponentIds.delete(id)
    }
  })
}

function handleComponentSelection(event) {
  const componentId = Number(event.target.dataset.componentSelect)
  if (!componentId) {
    return
  }

  if (event.target.checked) {
    state.selectedComponentIds.add(componentId)
  } else {
    state.selectedComponentIds.delete(componentId)
  }

  renderResumePreview()
}

function handleComponentDelete(event) {
  const componentId = Number(event.target.dataset.componentDelete)
  if (!componentId) {
    return
  }

  const component = state.components.find((item) => item.id === componentId)
  const label = component ? component.title : 'this ingredient'

  if (window.confirm(`Delete ${label}? This cannot be undone.`)) {
    deleteComponent(componentId)
  }
}

function initializeRichTextEditor() {
  if (!window.Quill) {
    console.error('Quill failed to load from node_modules.')
    return
  }

  state.quill = new window.Quill('#quillEditor', {
    theme: 'snow',
    placeholder: 'Add bullets, a short skills list, or details for this ingredient',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean']
      ]
    }
  })

  state.quill.on('text-change', () => {
    document.getElementById('txtContent').value = getEditorContent()
  })
}

function updateComponentFieldsForType() {
  const typeName = document.getElementById('selType').value
  const isSkills = typeName.toLowerCase() === 'skills'

  document.querySelectorAll('[data-component-field]').forEach((field) => {
    field.classList.toggle('hidden', isSkills)
  })

  document.getElementById('txtTitle').required = !isSkills
  document.querySelector('label[for="txtContent"]').textContent = isSkills ? 'Skills list' : 'Details or bullets'

  if (state.quill) {
    state.quill.root.dataset.placeholder = isSkills
      ? 'Add skills as bullets, comma-separated text, or grouped categories'
      : 'Add bullets or details for this ingredient'
  }
}

function getEditorContent() {
  if (!state.quill) {
    return getFormValue(new FormData(document.getElementById('frmComponent')), 'content')
  }

  // Quill represents an empty editor as a blank line; treat that as no content.
  if (!state.quill.getText().trim()) {
    return ''
  }

  return sanitizeRichText(state.quill.root.innerHTML.trim())
}

function setEditorHtml(html) {
  if (!state.quill) {
    document.getElementById('txtContent').value = html
    return
  }

  state.quill.setContents([])
  if (html) {
    state.quill.clipboard.dangerouslyPasteHTML(sanitizeRichText(html))
  }
  document.getElementById('txtContent').value = getEditorContent()
}

function textToHtml(text) {
  const lines = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    return ''
  }

  const listItems = lines
    .map((line) => line.replace(/^[-*]\s*/, ''))
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('')

  return `<ul>${listItems}</ul>`
}

function sanitizeRichText(value) {
  const template = document.createElement('template')
  template.innerHTML = String(value || '')
  normalizeQuillLists(template.content)

  const allowedTags = new Set(['B', 'BR', 'DIV', 'EM', 'I', 'LI', 'OL', 'P', 'SPAN', 'STRONG', 'U', 'UL'])
  template.content.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      return
    }

    Array.from(element.attributes).forEach((attribute) => {
      element.removeAttribute(attribute.name)
    })
  })

  return template.innerHTML
}

function normalizeQuillLists(root) {
  root.querySelectorAll('ol').forEach((list) => {
    const items = Array.from(list.children).filter((child) => child.tagName === 'LI')
    const isQuillBulletList = items.length > 0 && items.every((item) => item.dataset.list === 'bullet')

    if (!isQuillBulletList) {
      return
    }

    const unorderedList = document.createElement('ul')
    Array.from(list.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'LI') {
        child.removeAttribute('data-list')
      }
      unorderedList.appendChild(child)
    })
    list.replaceWith(unorderedList)
  })
}

function requireAuthView(viewName) {
  showView(state.user ? viewName : 'auth')
}

function showView(viewName) {
  Object.values(views).forEach((view) => view.classList.add('hidden'))
  views[viewName].classList.remove('hidden')
  if (viewName === 'viewer') {
    renderResumePreview()
  }
}

function updateUserUi() {
  const authed = Boolean(state.user)
  document.getElementById('navbar-user').classList.toggle('hidden', !authed)
  document.getElementById('userDisplayName').textContent = authed
    ? [state.user.firstName, state.user.lastName].filter(Boolean).join(' ') || state.user.email
    : 'Guest'
  document.getElementById('userDisplayEmail').textContent = authed ? state.user.email : ''

  if (authed) {
    const form = document.getElementById('frmBasics')
    form.firstName.value = state.user.firstName || ''
    form.lastName.value = state.user.lastName || ''
    form.phoneNumber.value = state.user.phoneNumber || ''
    form.occupation.value = state.user.occupation || ''
  }
}

function apiFetch(url, options = {}) {
  const fetchOptions = {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body)
  }

  return fetch(url, fetchOptions).then((response) => {
    return response.json().then((data) => {
      if (!response.ok) {
        throw new Error(data.message || 'Request failed.')
      }
      return data
    })
  })
}

function showError(err) {
  console.error(err)
  setStatus(err.message || 'Something went wrong.', true)
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message
  statusMessage.classList.toggle('text-red-700', isError)
  statusMessage.classList.toggle('text-green-700', !isError)
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
