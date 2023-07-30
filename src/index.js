import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App'
import './index.css'

axios.get('http://localhost:3004/persons').then(response => {
  const Persons = response.data
  ReactDOM.createRoot(document.getElementById('root')).render(<App notes={Persons} />)
})