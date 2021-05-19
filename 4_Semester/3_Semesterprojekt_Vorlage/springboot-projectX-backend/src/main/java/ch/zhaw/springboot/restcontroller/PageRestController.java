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

import ch.zhaw.springboot.entities.Page;
import ch.zhaw.springboot.repositories.PageRepository;

@RestController
public class PageRestController {
	@Autowired
	private PageRepository repository;

	@RequestMapping(value = "projectX/pages", method = RequestMethod.GET)
	public ResponseEntity<List<Page>> getPages() {
		List<Page> result = this.repository.findAll();

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Page>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Page>>(HttpStatus.NOT_FOUND);
		}
	}
	
	//@GetMapping ("expenses/persons/{id}") -> geht auch
	@RequestMapping(value = "projectX/pages/{id}", method = RequestMethod.GET)
	public ResponseEntity<Page> getPageById(@PathVariable("id")long id) {
		Optional<Page> result = this.repository.findById(id);
		
		if (result.isEmpty()) {
			return new ResponseEntity<Page>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<Page>(result.get(), HttpStatus.NOT_FOUND);	
	}

}
