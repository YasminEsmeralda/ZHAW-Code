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

import ch.zhaw.springboot.entities.Item;
import ch.zhaw.springboot.repositories.ItemRepository;

@RestController
public class ItemRestController {

	@Autowired
	private ItemRepository repository;

	@RequestMapping(value = "website/items", method = RequestMethod.GET)
	public ResponseEntity<List<Item>> getItems() {
		List<Item> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Item>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Item>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/items/id={id}", method = RequestMethod.GET)
	public ResponseEntity<Item> getItemById(@PathVariable("id") long id) {
		Optional<Item> result = this.repository.findById(id);

		if (result.isEmpty()) {
			return new ResponseEntity<Item>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<Item>(result.get(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/items/viewsLess={views}", method = RequestMethod.GET)
	public ResponseEntity<List<Item>> getViewsLessThan(@PathVariable("views") int views) {
		List<Item> result = this.repository.findViewsLessThan(views);

		if (result.isEmpty()) {
			return new ResponseEntity<List<Item>>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<List<Item>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/items/viewsGreater={views}", method = RequestMethod.GET)
	public ResponseEntity<List<Item>> getViewsGreaterThan(@PathVariable("views") int views) {
		List<Item> result = this.repository.findViewsGreaterThan(views);

		if (result.isEmpty()) {
			return new ResponseEntity<List<Item>>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<List<Item>>(result, HttpStatus.OK);
	}

}
