const axios = require('axios')
const urlJoin = require('url-join')

const apiHost = process.env.API_HOST || '/api'
const NODE_ENV = process.env.NODE_ENV
const DEBUG = (NODE_ENV !== 'production')

if (DEBUG) {
  axios.interceptors.request.use(function (config) {
    config.withCredentials = true
    return config
  })
}

module.exports = {
  async getSheets () {
    const url = constructUrl('/sheets')
    const response = await axios.get(url)
    return response.data
  },

  async createSheet (data) {
    const url = constructUrl('/sheets')
    const response = await axios.post(url, data)
    return response.data
  },

  async updateSheet (sheetName, updates) {
    const url = constructUrl(`/sheets/${sheetName}`)
    const response = await axios.patch(url, updates)
    return response.data
  },

  async deleteSheet (sheetName) {
    const url = constructUrl(`/sheets/${sheetName}`)
    return axios.delete(url)
  },

  async getRows (sheetName) {
    const url = constructUrl(`/sheets/${sheetName}/rows`)
    const response = await axios.get(url)
    return response.data
  },

  async updateRow (sheetName, updates, conditions) {
    const url = constructUrl(`/sheets/${sheetName}/rows`)
    const params = conditions
    const response = await axios.patch(url, updates, { params })
    return response.data
  },

  async createRow (sheetName, data) {
    const url = constructUrl(`/sheets/${sheetName}/rows`)
    const response = await axios.post(url, data)
    return response.data
  },

  async deleteRow (sheetName, conditions) {
    const url = constructUrl(`/sheets/${sheetName}/rows`)
    const params = conditions
    return axios.delete(url, { params })
  },

  async getColumns (sheetName) {
    const url = constructUrl(`/sheets/${sheetName}/columns`)
    const response = await axios.get(url)
    return response.data
  },

  async createColumn (sheetName, columnName) {
    const url = constructUrl(`/sheets/${sheetName}/columns`)
    const payload = { name: columnName }
    const response = await axios.post(url, payload)
    return response.data
  },

  async updateColumn (sheetName, columnName, updates) {
    const url = constructUrl(`/sheets/${sheetName}/columns/${columnName}`)
    const response = await axios.patch(url, updates)
    return response.data
  },

  async deleteColumn (sheetName, columnName) {
    const url = constructUrl(`/sheets/${sheetName}/columns/${columnName}`)
    return axios.delete(url)
  },

  async authenticate (authCode) {
    const url = constructUrl(`/authenticate/?code=${authCode}`)
    const response = await axios.post(url)
    return response.data
  },

  async logout () {
    const url = constructUrl(`/logout`)
    return await axios.post(url)
  },

  async getCurrentUser () {
    const url = constructUrl(`/user`)
    const response = await axios.get(url)
    return response.data
  }
}

function constructUrl (path) {
  return urlJoin(apiHost, path)
}
