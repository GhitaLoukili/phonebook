const express = require('express')
const app = express()
const morgan=require('morgan')
const cors=require('cors')
require('dotenv').config()

const Person=require('./models/person')
app.use(cors())
app.use(express.static('build'))

morgan.token('type', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map((person) => person.toJSON()))
  })
})

app.get('/api/persons/:id', (request, response,next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        // no person found by this id
        response.status(404).end() }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(
      `<div>
      <span>Phonebook has info for ${persons.length} people</span></div>
      <span>${new Date().toString()}</span>`
    )
  })
    .catch(error => {
      console.log(error)
      response.status(500).json({ error: 'Something went wrong.' })
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { body } = request

  // Error handling
  if (!body.name) {
    return request.status(400).json({
      error: 'name is required',
    })
  }
  if (!body.number) {
    return request.status(400).json({
      error: 'number is required',
    })
  }

  const person =  new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      response.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name,number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name,number }, { new:true, runValidators:true,context:'query' })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.message.includes('ObjectId')) {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})