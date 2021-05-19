package ch.zhaw.springboot.restcontroller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.springboot.entities.Navigation;
import ch.zhaw.springboot.repositories.NavigationRepository;

@RestController
public class NavigationRestController {
	@Autowired
	private NavigationRepository repository;

	@RequestMapping(value = "projectX/navigations", method = RequestMethod.GET)
	public ResponseEntity<List<Navigation>> getNavigations() {
		List<Navigation> result = this.repository.findAll();

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Navigation>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Navigation>>(HttpStatus.NOT_FOUND);
		}
	}
	
	//@GetMapping ("expenses/persons/{id}") -> geht auch
	@RequestMapping(value = "projectX/navigations/{id}", method = RequestMethod.GET)
	public ResponseEntity<Navigation> getNavigationById(@PathVariable("id") long id) {
		Optional<Navigation> result = this.repository.findById(id);
		
		if (result.isEmpty()) {
			return new ResponseEntity<Navigation>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<Navigation>(result.get(), HttpStatus.NOT_FOUND);	
	}

}
