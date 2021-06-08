package ch.zhaw.springboot.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.springboot.entities.Page;
import ch.zhaw.springboot.repositories.PageRepository;

@RestController
public class PageRestController {

	@Autowired
	private PageRepository repository;

	@RequestMapping(value = "website/pages", method = RequestMethod.GET)
	public ResponseEntity<List<Page>> getCoaches() {
		List<Page> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Page>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Page>>(result, HttpStatus.OK);
	}
}
