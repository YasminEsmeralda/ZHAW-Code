package ch.zhaw.springboot.restcontroller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.springboot.entities.Navigation;
import ch.zhaw.springboot.models.NavigationRequest;
import ch.zhaw.springboot.repositories.ItemRepository;
import ch.zhaw.springboot.repositories.MenuRepository;
import ch.zhaw.springboot.repositories.NavigationRepository;

@RestController
public class NavigationRestController {

	@Autowired
	private NavigationRepository repository;
	
	@Autowired
	private MenuRepository repositoryMenu;
	
	@Autowired
	private ItemRepository repositoryItem;

	@RequestMapping(value = "website/navigations", method = RequestMethod.GET)
	public ResponseEntity<List<Navigation>> getNavigations() {
		List<Navigation> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Navigation>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Navigation>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/navigations/id={id}", method = RequestMethod.GET)
	public ResponseEntity<Navigation> getNavigationById(@PathVariable("id") long id) {
		Optional<Navigation> result = this.repository.findById(id);

		if (result.isEmpty()) {
			return new ResponseEntity<Navigation>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<Navigation>(result.get(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/navigations/type={type}", method = RequestMethod.GET)
	public ResponseEntity<List<Navigation>> getNavigationsByType(@PathVariable("type") int type) {
		List<Navigation> result;
		
		if (type == 1) {
			result = this.repositoryMenu.getNavigationMenu(); 
		} else if (type == 2) {
			result = this.repositoryItem.getNavigationItem(); 
		} else {
			return new ResponseEntity<List<Navigation>>(HttpStatus.NOT_ACCEPTABLE);
		}
		
		if (result.isEmpty()) {
			return new ResponseEntity<List<Navigation>>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<List<Navigation>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/navigations/new", method = RequestMethod.POST)
	public ResponseEntity<Navigation> creatPerson(@RequestBody NavigationRequest navigationRequest) {
		
		Navigation result;
		
		try {
			//Customer customer = this.repositoryCustomer.findById(diaryRequest.customer_id).get();
			result = this.repository.save(new Navigation(navigationRequest.layout));
			return new ResponseEntity<Navigation>(result, HttpStatus.NOT_FOUND);
		} catch (Exception e) {
			return new ResponseEntity<Navigation>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
