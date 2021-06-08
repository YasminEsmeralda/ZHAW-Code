package ch.zhaw.springboot.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<List<Item>> getCoaches() {
		List<Item> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Item>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Item>>(result, HttpStatus.OK);
	}
}
