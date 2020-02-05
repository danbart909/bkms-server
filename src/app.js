require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('./logger')
const { NODE_ENV, API_TOKEN } = require('./config')
const bookmarksRouter = require('./bookmarks-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'combined'

app
  .use(morgan(morganOption))
  .use(helmet())
  .use(cors())
  // .use(express.json())

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')

  if (!authToken || authToken.split(' ')[1] !== API_TOKEN) {
    logger.error(`Unauthorized request to path: ${req.path}`)
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  next() // move to the next middleware
})

app
  .use(bookmarksRouter)

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
    } else {
      response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app