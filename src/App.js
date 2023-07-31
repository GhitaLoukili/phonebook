import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import Error from './components/Error'
import personService from './services/person'


const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber,setNewNumber]=useState('')
  const [filteredPersons,setFilteredPersons]=useState([])
  const [loading, setLoading] = useState(true)
  const [notifMessage,setNotifMessage]=useState('')
  const [errorMessage,setErrorMessage]=useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons || [])
        setFilteredPersons(initialPersons || [])
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setPersons([]); // Set to an empty array in case of an error
        setFilteredPersons([]);
        setLoading(false);
      });
    }, [])


  const addPerson=(event)=> {
    event.preventDefault()
    const personObject={
      name:newName,
      number:newNumber
    }
    personService
      .create(personObject)
      .then(returnedPerson=>{
        setPersons(persons.concat(returnedPerson.data))
        setFilteredPersons(filteredPersons.concat(returnedPerson.data))
        setNewName('')
        setNewNumber('')
        setNotifMessage(`Added ${newName}`)
        setTimeout(() => {
          setNotifMessage(null)
        }, 5000)
      })
      .catch(error=>{
        setErrorMessage('Error adding a new person')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }

  const deletePerson=(id)=> {
    const personToDelete = persons.find((person) => person.id === id);
    if (window.confirm(`Delete '${personToDelete.name}' ?`)) {
      personService
      .deleteP(id)
      .then(()=>{
        setPersons(persons.filter(person=>person.id!==id))
        setFilteredPersons(filteredPersons.filter(person=>person.id!==id))
        setNewName('')
        setNewNumber('')
        setNotifMessage(`Removed ${personToDelete.name}`)
        setTimeout(() => {
          setNotifMessage(null)
        }, 5000)
      })
      .catch(error=>{
        setErrorMessage(
          `Information of '${personToDelete.name}' has already been removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
    }}


  const handleNameChange=(event)=>{
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNumberChange=(event)=>{
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }

  const checkPerson=(event)=> {
    event.preventDefault()
    const personToAdd=persons.find(person=>person.name===newName)
    if(personToAdd){
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one ?`)) {
        const changedPerson={...personToAdd,number:newNumber}
        personService
        .update(personToAdd.id,changedPerson)
        .then(returnedPerson => {
          if (returnedPerson && returnedPerson.data && returnedPerson.data.id) {
            setPersons(persons.map(person => (person.id !== returnedPerson.data.id ? person : returnedPerson.data)));
            setFilteredPersons(filteredPersons.map(person => (person.id !== returnedPerson.data.id ? person : returnedPerson.data)));
            setNewName('');
            setNewNumber('');
            setNotifMessage(`Changed number of ${newName}`);
            setTimeout(() => {
              setNotifMessage(null);
            }, 5000);
          } else {
            console.error('Error: Returned person data or id is undefined or invalid.');
          }
        })
        .catch(error => {
          if (error.response && error.response.status === 404) {
            // The server responded with a 404 Not Found status,indicating that the person has already been removed from the server
            setErrorMessage(
              `Information of '${personToAdd.name}' has already been removed from server`
            );
            setPersons(persons.filter(person => person.id !== personToAdd.id));
            setFilteredPersons(filteredPersons.filter(person => person.id !== personToAdd.id));
          } else {
            // Other types of errors
            setErrorMessage("Error updating the number.");
          }
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
        });

      }
    }
    else{
      addPerson(event)
    }
  }

  const searchName=(event)=> {
    event.preventDefault()
    const searchName=event.target.value
    const result=persons.filter(person=>person.name.toLowerCase().includes(searchName.toLowerCase()))
    setFilteredPersons(result)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      {notifMessage && <Notification message={notifMessage} />}
      {errorMessage && <Error message={errorMessage} />}   
      {!loading ? (
        <>
          <Filter onChange={searchName} />
          <h2>add a new</h2>
          <PersonForm
            addPerson={addPerson}
            newName={newName}
            handleNameChange={handleNameChange}
            newNumber={newNumber}
            handleNumberChange={handleNumberChange}
            checkPerson={checkPerson}
          />
          <h2>Numbers</h2>
          <Persons persons={filteredPersons || []} deletePerson={deletePerson} />
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}

export default App