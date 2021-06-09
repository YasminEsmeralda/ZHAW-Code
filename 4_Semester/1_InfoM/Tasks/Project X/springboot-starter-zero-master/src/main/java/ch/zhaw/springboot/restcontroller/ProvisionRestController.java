package ch.zhaw.springboot.restcontroller;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
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
	public ResponseEntity<List<Provision>> getProvisions() {
		List<Provision> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Provision>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Provision>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/provisions/id={id}", method = RequestMethod.GET)
	public ResponseEntity<Provision> getProvisionById(@PathVariable("id") long id) {
		Optional<Provision> result = this.repository.findById(id);

		if (result.isEmpty()) {
			return new ResponseEntity<Provision>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<Provision>(result.get(), HttpStatus.OK);
	}
	
	//add website to search after from/to with calendar
	@RequestMapping(value = "website/provisions/date={date}", method = RequestMethod.GET)
	public ResponseEntity<List<Provision>> getProvisionByRange(@PathVariable("date") @DateTimeFormat(pattern = "yyyy-mm-dd") Date date) {
		List<Provision> result = this.repository.findProvisionByRange(date);

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Provision>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Provision>>(HttpStatus.NOT_FOUND);
		}
	}
}
