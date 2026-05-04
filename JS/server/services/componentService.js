const { all, get, run } = require('../db')

async function listTypes() {
  const rows = await all('SELECT TypeName, TypeFields FROM tblTypes ORDER BY TypeName')
  return rows.map((row) => ({
    typeName: row.TypeName,
    description: row.TypeFields ? String(row.TypeFields) : ''
  }))
}

async function createComponent(userId, component) {
  const result = await run(
    `INSERT INTO resume_components
      (user_id, type_name, title, organization, start_date, end_date, location, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      component.typeName,
      component.title,
      component.organization,
      component.startDate,
      component.endDate,
      component.location,
      component.content
    ]
  )

  return getComponent(userId, result.id)
}

async function listComponents(userId) {
  return all(
    `SELECT id, type_name AS typeName, title, organization, start_date AS startDate,
      end_date AS endDate, location, content, created_at AS createdAt
     FROM resume_components
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC`,
    [userId]
  )
}

async function getComponent(userId, id) {
  return get(
    `SELECT id, type_name AS typeName, title, organization, start_date AS startDate,
      end_date AS endDate, location, content, created_at AS createdAt
     FROM resume_components
     WHERE user_id = ? AND id = ?`,
    [userId, id]
  )
}

async function deleteComponent(userId, id) {
  const result = await run('DELETE FROM resume_components WHERE user_id = ? AND id = ?', [userId, id])
  return result.changes > 0
}

module.exports = {
  createComponent,
  deleteComponent,
  listComponents,
  listTypes
}
