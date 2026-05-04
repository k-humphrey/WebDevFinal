const assert = require('node:assert/strict')
const test = require('node:test')

const { initializeDatabase, run } = require('../JS/server/db')
const { createComponent, deleteComponent, listComponents } = require('../JS/server/services/componentService')

test('deleteComponent removes only the matching user component', async () => {
  await initializeDatabase()

  const suffix = `${Date.now()}-${Math.random()}`
  const userOne = await run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [
    `delete-one-${suffix}@example.com`,
    'salt:hash'
  ])
  const userTwo = await run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [
    `delete-two-${suffix}@example.com`,
    'salt:hash'
  ])

  const component = await createComponent(userOne.id, {
    typeName: 'Experience',
    title: 'Cashier',
    organization: 'McDonalds',
    startDate: '2022',
    endDate: '2026',
    location: 'Cookeville',
    content: '<ul><li>Served customers</li></ul>'
  })

  assert.equal(await deleteComponent(userTwo.id, component.id), false)
  assert.equal((await listComponents(userOne.id)).some((item) => item.id === component.id), true)

  assert.equal(await deleteComponent(userOne.id, component.id), true)
  assert.equal((await listComponents(userOne.id)).some((item) => item.id === component.id), false)
})
