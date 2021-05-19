package ch.zhaw.springboot.restcontroller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.springboot.entities.Infection;
import ch.zhaw.springboot.entities.Person;
import ch.zhaw.springboot.repositories.PersonRepository;

@RestController
@CrossOrigin
public class PersonRestController {
	@Autowired
	private PersonRepository repository;

	@RequestMapping(value = "infections/persons", method = RequestMethod.GET)
	public ResponseEntity<List<Person>> getPersons() {
		List<Person> result = this.repository.findAll();

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Person>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Person>>(HttpStatus.NOT_FOUND);
		}
	}

	@RequestMapping(value = "infections/persons/{id}", method = RequestMethod.GET)
	public ResponseEntity<Person> getPathogenById(@PathVariable("id") long id) {
		Optional<Person> result = this.repository.findById(id);

		if (result.isPresent()) {
			return new ResponseEntity<Person>(result.get(), HttpStatus.OK);
		} else {
			return new ResponseEntity<Person>(HttpStatus.NOT_FOUND);
		}
	}
	
	@RequestMapping(value = "infections/persons", method = RequestMethod.POST)
	public ResponseEntity<Person> createPerson(@RequestBody Person person) {
		Person result = this.repository.save(person);
		return new ResponseEntity<Person>(result, HttpStatus.OK);
	}
}
