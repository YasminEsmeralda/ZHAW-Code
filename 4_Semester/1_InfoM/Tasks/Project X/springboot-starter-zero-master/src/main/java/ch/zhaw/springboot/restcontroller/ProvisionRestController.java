package ch.zhaw.springboot.restcontroller;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import ch.zhaw.springboot.entities.Navigation;
import ch.zhaw.springboot.entities.Page;
import ch.zhaw.springboot.entities.Provision;
import ch.zhaw.springboot.models.ProvisionRequest;
import ch.zhaw.springboot.repositories.NavigationRepository;
import ch.zhaw.springboot.repositories.PageRepository;
import ch.zhaw.springboot.repositories.ProvisionRepository;

@RestController
@CrossOrigin
public class ProvisionRestController {

	@Autowired
	private ProvisionRepository repository;
	
	@Autowired
	private PageRepository repositoryPage;
	
	@Autowired
	private NavigationRepository repositoryNavigation;

	@RequestMapping(value = "website/provisions", method = RequestMethod.GET)
	public ResponseEntity<List<Provision>> getProvisions() {
		List<Provision> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Provision>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Provision>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/provisions/{id}", method = RequestMethod.GET)
	public ResponseEntity<Provision> getProvisionById(@PathVariable("id") long id) {
		Optional<Provision> result = this.repository.findById(id);

		if (result.isEmpty()) {
			return new ResponseEntity<Provision>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<Provision>(result.get(), HttpStatus.OK);
	}
	
	//add website to search after from/to with calendar
	@RequestMapping(value = "website/provisions/date/{date}", method = RequestMethod.GET)
	public ResponseEntity<List<Provision>> getProvisionByRange(@PathVariable("date") @DateTimeFormat(pattern = "yyyy-mm-dd") Date date) {
		List<Provision> result = this.repository.findProvisionByRange(date);

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Provision>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Provision>>(HttpStatus.NOT_FOUND);
		}
	}
	
	@RequestMapping(value = "website/provisions", method = RequestMethod.POST)
	public ResponseEntity<Provision> createProvision(@RequestBody ProvisionRequest provisionRequest) {

		try {
			Page page = this.repositoryPage.findById(provisionRequest.page_id).get();
			Navigation navigation = this.repositoryNavigation.findById(provisionRequest.navigation_id).get();
			Provision result = this.repository.save(new Provision(provisionRequest.dateFrom, provisionRequest.dateTo, page, navigation));
			return new ResponseEntity<Provision>(result, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<Provision>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	@RequestMapping(value = "website/provisions/{id}", method = RequestMethod.DELETE)
	public ResponseEntity<String> deleteProvisionById(@PathVariable("id") long id, RedirectAttributes redirAttrs) {
		boolean exists = repository.existsById(id);

		if (exists) {
			this.repository.deleteById(id);
			return new ResponseEntity<String>(HttpStatus.OK);
		} else {
			redirAttrs.addFlashAttribute("msginfo", "ctl-todo.delete.msginfo.id-not-exist");
			redirAttrs.addFlashAttribute("requestedId", id);

			return new ResponseEntity<String>("redirect:/todo/delete" + id, HttpStatus.CONFLICT);
		}
	}
}
