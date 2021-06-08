package ch.zhaw.springboot.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.springboot.entities.Provision;
import ch.zhaw.springboot.repositories.ProvisionRepository;

@RestController
public class ProvisionRestController {

	@Autowired
	private ProvisionRepository repository;

	@RequestMapping(value = "website/provisions", method = RequestMethod.GET)
	public ResponseEntity<List<Provision>> getCoaches() {
		List<Provision> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Provision>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Provision>>(result, HttpStatus.OK);
	}
}
