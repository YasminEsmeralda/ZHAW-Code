package ch.zhaw.springboot.restcontroller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.springboot.entities.Pathogen;
import ch.zhaw.springboot.repositories.PathogenRepository;

@RestController
@CrossOrigin
public class PathogenRestController {

	@Autowired
	private PathogenRepository repository;

	@RequestMapping(value = "infections/pathogens", method = RequestMethod.GET)
	public ResponseEntity<List<Pathogen>> getPathogens() {
		List<Pathogen> result = this.repository.findAll();

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Pathogen>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Pathogen>>(HttpStatus.NOT_FOUND);
		}
	}

	@RequestMapping(value = "infections/pathogens/{id}", method = RequestMethod.GET)
	public ResponseEntity<Pathogen> getPathogenById(@PathVariable("id") long id) {
		Optional<Pathogen> result = this.repository.findById(id);

		if (result.isPresent()) {
			return new ResponseEntity<Pathogen>(result.get(), HttpStatus.OK);
		} else {
			return new ResponseEntity<Pathogen>(HttpStatus.NOT_FOUND);
		}
	}
}
