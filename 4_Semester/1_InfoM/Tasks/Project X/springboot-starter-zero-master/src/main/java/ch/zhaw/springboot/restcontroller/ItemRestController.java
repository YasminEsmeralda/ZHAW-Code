package ch.zhaw.springboot.restcontroller;

import java.util.List;
import java.util.Optional;

import javax.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import ch.zhaw.springboot.entities.Item;
import ch.zhaw.springboot.entities.Menu;
import ch.zhaw.springboot.repositories.ItemRepository;
import ch.zhaw.springboot.repositories.MenuRepository;

@RestController
@CrossOrigin
public class ItemRestController {

	@Autowired
	private ItemRepository repository;
	
	@Autowired
	private MenuRepository repositoryMenu;

	@RequestMapping(value = "website/items", method = RequestMethod.GET)
	public ResponseEntity<List<Item>> getItems() {
		List<Item> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Item>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Item>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/items/{id}", method = RequestMethod.GET)
	public ResponseEntity<Item> getItemById(@PathVariable("id") long id) {
		Optional<Item> result = this.repository.findById(id);

		if (result.isEmpty()) {
			return new ResponseEntity<Item>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<Item>(result.get(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/items/less/{views}", method = RequestMethod.GET)
	public ResponseEntity<List<Item>> getViewsLessThan(@PathVariable("views") int views) {
		List<Item> result = this.repository.findViewsLessThan(views);

		if (result.isEmpty()) {
			return new ResponseEntity<List<Item>>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<List<Item>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/items/greater/{views}", method = RequestMethod.GET)
	public ResponseEntity<List<Item>> getViewsGreaterThan(@PathVariable("views") int views) {
		List<Item> result = this.repository.findViewsGreaterThan(views);

		if (result.isEmpty()) {
			return new ResponseEntity<List<Item>>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<List<Item>>(result, HttpStatus.OK);
	}

	@RequestMapping(value = "website/items/{id}", method = RequestMethod.POST)
	public ResponseEntity<Item> createItem(@PathVariable("id") long id, @RequestBody Item itemRequest) {
		
		try {
			Item result = this.repository.save(itemRequest);
			//handle menu parent
			try {
				Menu menu = repositoryMenu.getOne(id);
				menu.addChild(result);
				this.repositoryMenu.save(menu);
			} catch(EntityNotFoundException e) {
				System.out.println("No parent added");
			}
			
			return new ResponseEntity<Item>(result, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<Item>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@RequestMapping(value = "website/items/{id}", method = RequestMethod.DELETE)
	public ResponseEntity<String> deleteItemById(@PathVariable("id") long id, RedirectAttributes redirAttrs) {
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
