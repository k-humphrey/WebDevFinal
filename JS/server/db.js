const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const dbPath = path.join(__dirname, '..', '..', 'Resumes.db')
const db = new sqlite3.Database(dbPath)

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err)
        return
      }
      resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
        return
      }
      resolve(row)
    })
  })
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
        return
      }
      resolve(rows)
    })
  })
}

async function initializeDatabase() {
  await run('PRAGMA foreign_keys = ON')

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      phone_number TEXT NOT NULL DEFAULT '',
      occupation TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  await run(`
    CREATE TABLE IF NOT EXISTS resume_components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type_name TEXT NOT NULL,
      title TEXT NOT NULL,
      organization TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL DEFAULT '',
      end_date TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  await run(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  await run(`
    CREATE TABLE IF NOT EXISTS resume_component_links (
      resume_id INTEGER NOT NULL,
      component_id INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (resume_id, component_id),
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
      FOREIGN KEY (component_id) REFERENCES resume_components(id) ON DELETE CASCADE
    )
  `)

  await seedTypes()
}

async function seedTypes() {
  await run(`
    CREATE TABLE IF NOT EXISTS tblTypes (
      TypeName TEXT NOT NULL UNIQUE PRIMARY KEY,
      TypeFields BLOB
    )
  `)

  const types = [
    ['Experience', 'Work history, internships, leadership roles, and project ownership'],
    ['Education', 'Schools, degrees, certifications, coursework, and honors'],
    ['Skills', 'Technical tools, soft skills, languages, and competencies'],
    ['Project', 'Portfolio, class, professional, or volunteer projects']
  ]

  for (const [name, description] of types) {
    await run('INSERT OR IGNORE INTO tblTypes (TypeName, TypeFields) VALUES (?, ?)', [name, description])
  }
}

module.exports = {
  all,
  get,
  initializeDatabase,
  run
}
