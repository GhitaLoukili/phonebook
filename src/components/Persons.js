const Persons = ({ persons, deletePerson }) => {
  if (!persons || persons.length === 0) {
    return <div>No persons to show.</div>;
  }

  return (
    <div>
      {persons.map((person) => (
        <div key={person.id}>
          {person.name} {person.number}{' '}
          <button onClick={() => deletePerson(person.id)}>delete</button>
        </div>
      ))}
    </div>
  );
};

export default Persons;
