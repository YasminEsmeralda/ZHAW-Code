package ch.zhaw.springboot.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.springboot.entities.Navigation;
import ch.zhaw.springboot.repositories.NavigationRepository;

@RestController
public class NavigationRestController {

	@Autowired
	private NavigationRepository repository;

	@RequestMapping(value = "website/navigations", method = RequestMethod.GET)
	public ResponseEntity<List<Navigation>> getCoaches() {
		List<Navigation> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Navigation>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Navigation>>(result, HttpStatus.OK);
	}
}
