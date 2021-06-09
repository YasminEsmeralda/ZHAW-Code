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
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import ch.zhaw.springboot.entities.Menu;
import ch.zhaw.springboot.entities.Navigation;
import ch.zhaw.springboot.entities.Page;
import ch.zhaw.springboot.entities.Provision;
import ch.zhaw.springboot.models.MenuRequest;
import ch.zhaw.springboot.models.NavigationRequest;
import ch.zhaw.springboot.models.ProvisionRequest;
import ch.zhaw.springboot.repositories.MenuRepository;

@RestController
public class MenuRestController {

	@Autowired
	private MenuRepository repository;

	@RequestMapping(value = "website/menus", method = RequestMethod.GET)
	public ResponseEntity<List<Menu>> getMenus() {
		List<Menu> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Menu>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Menu>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/menus/id={id}", method = RequestMethod.GET)
	public ResponseEntity<Menu> getMenuById(@PathVariable("id") long id) {
		Optional<Menu> result = this.repository.findById(id);

		if (result.isEmpty()) {
			return new ResponseEntity<Menu>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<Menu>(result.get(), HttpStatus.OK);
	}
}
