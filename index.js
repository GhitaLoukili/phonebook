require('dotenv').config()
const express = require('express')
const app = express()
const morgan=require('morgan')
const cors=require('cors')
const Person=require('./models/person')

app.use(cors())
app.use(express.json())

morgan.token('type', (req, res) => {
    if (req.method === 'POST') {
        console.log(req.body)
        return JSON.stringify(req.body)
    }
    return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))
app.use(express.static('build'))

let persons = [
]

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })

// app.get('/info', (request, response) => {
//     response.send(
//         "<p>Phonebook has info for "+persons.length+" people</p>"
//         +"<p>"+new Date()+"</p>"
//     )
// })

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
      response.json(person)
    })
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    Person.findByIdAndRemove(id)
      .then(() => {
        response.status(204).end();
      })
      .catch(error => {
        console.log(error);
        response.status(500).json({ error: 'Something went wrong.' });
      });
  });
  

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({error: 'name missing'})
    }
    if (!body.number) {
        return response.status(400).json({error: 'number missing'})
    }
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({error: 'name must be unique'})
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    })
    
    person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => {
      console.log(error);
      response.status(500).json({ error: 'Something went wrong.' });
    });
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})