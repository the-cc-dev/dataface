const db = require('./clients/postgrest')
const pick = require('lodash/pick')

module.exports = function store (state, emitter) {
  state.store = {
    sheets: [],
    activeSheet: {
      fields: null,
      rows: null,
      name: null
    }
  }

  emitter.on('pushState', function (location) {
    const sheet = location.split('/').pop()
    emitter.emit('store:selectSheet', sheet)
  })

  emitter.on('store:getList', async function () {
    try {
      state.store.sheets = await db.getTables()
      const activeSheetName = getActiveSheet()
      emitter.emit('store:selectSheet', activeSheetName)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:selectSheet', async function (table) {
    try {
      state.store.activeSheet = {
        rows: await db.getRows(table),
        fields: await db.getSchema(table),
        name: table
      }
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:update', async function (data) {
    try {
      const { rowIndex, updates } = data
      const activeSheet = state.store.activeSheet
      const table = activeSheet.name
      const row = activeSheet.rows[rowIndex]
      const primaryKeys = getPrimaryKeys(activeSheet.fields)
      const conditions = primaryKeys.length ? pick(row, primaryKeys) : row
      const newRow = await db.update(table, updates, conditions)
      state.store.activeSheet.rows[rowIndex] = newRow
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:deleteRow', async function (data) {
    try {
      const { rowIndex } = data
      const activeSheet = state.store.activeSheet
      const table = activeSheet.name
      const row = activeSheet.rows[rowIndex]
      const primaryKeys = getPrimaryKeys(activeSheet.fields)
      const conditions = primaryKeys.length ? pick(row, primaryKeys) : row
      await db.deleteRow(table, conditions)
      state.store.activeSheet.rows.splice(rowIndex, 1)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:renameField', async function (data) {
    try {
      const { columnIndex, oldValue, value } = data
      const table = state.store.activeSheet.name
      await db.renameField(table, oldValue, value)
      state.store.activeSheet.fields[columnIndex].name = value
      state.store.activeSheet.rows.map((row) => {
        row[value] = row[oldValue]
        delete row[oldValue]
        return row
      })
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  function getActiveSheet () {
    // Use param if exists, otherwise use first table in list
    if (state.params.sheet) {
      return state.params.sheet
    } else if (state.store.sheets.length > 0) {
      return state.store.sheets[0].name
    } else {
      return ''
    }
  }
}

function getPrimaryKeys (fields) {
  return fields.filter((field) => field.constraint === 'PRIMARY KEY')
    .map((field) => field.name)
}
