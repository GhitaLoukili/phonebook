const express = require('express')
const app = express()
const morgan=require('morgan')
const cors=require('cors')
require('dotenv').config()

const Person=require('./models/person')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

morgan.token('type', (req, res) => {
    if (req.method === 'POST') {
        console.log(req.body)
        return JSON.stringify(req.body)
    }
    return ''
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))
app.use(requestLogger)
app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })


app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() 
      }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
      response.send(
        "<p>Phonebook has info for " + persons.length + " people</p>"
        + "<p>" + new Date() + "</p>"
      );
    })
    .catch(error => {
      console.log(error);
      response.status(500).json({ error: 'Something went wrong.' });
    });
  });
  


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({error: 'name missing'})
    }
    if (!body.number) {
        return response.status(400).json({error: 'number missing'})
    }
    Person.findOne({name:body.name})
    .then(existingPerson=> {
        if (existingPerson) {
            // If the name exists, update the number of the existing person
            existingPerson.number = body.number;
            existingPerson.save()
              .then(savedPerson => {
                response.json(savedPerson);
              })
              .catch(error => {
                console.log(error);
                response.status(500).json({ error: 'Something went wrong.' });
              });
          } else {
            const person = new Person({
            name: body.name,
            number: body.number,
            })
            person.save().then(savedPerson => {
                response.json(savedPerson)
            })
            .catch(error => {
                console.log(error);
                response.status(500).json({ error: 'Something went wrong.' });
              })
          }
    })
    .catch(error=> next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const {name,number} = request.body
  
    Person.findByIdAndUpdate(request.params.id, {name,number}, {new:true, runValidators:true,context:"query" })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})