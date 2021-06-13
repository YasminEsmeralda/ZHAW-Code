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

import ch.zhaw.springboot.entities.Navigation;
import ch.zhaw.springboot.repositories.ItemRepository;
import ch.zhaw.springboot.repositories.MenuRepository;
import ch.zhaw.springboot.repositories.NavigationRepository;

@RestController
@CrossOrigin
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
	
	@RequestMapping(value = "website/navigations/{id}", method = RequestMethod.GET)
	public ResponseEntity<Navigation> getNavigationById(@PathVariable("id") long id) {
		Optional<Navigation> result = this.repository.findById(id);

		if (result.isEmpty()) {
			return new ResponseEntity<Navigation>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<Navigation>(result.get(), HttpStatus.OK);
	}	

	@RequestMapping(value = "website/navigations/type/{type}", method = RequestMethod.GET)
	public ResponseEntity<List<Navigation>> getNavigationsByType(@PathVariable("type") String type) {
		List<Navigation> result;
		String menu = "menu";
		String item = "item";
		
		if (type.equals(menu)) {
			result = this.repositoryMenu.getNavigationMenu(); 
		} else if (type.equals(item)) {
			result = this.repositoryItem.getNavigationItem(); 
		} else {
			return new ResponseEntity<List<Navigation>>(HttpStatus.NOT_ACCEPTABLE);
		}
		
		if (result.isEmpty()) {
			return new ResponseEntity<List<Navigation>>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<List<Navigation>>(result, HttpStatus.OK);
	}

}
