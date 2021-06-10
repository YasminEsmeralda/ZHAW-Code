package ch.zhaw.springboot.restcontroller;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

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

import ch.zhaw.springboot.entities.Page;
import ch.zhaw.springboot.models.PageRequest;
import ch.zhaw.springboot.repositories.PageRepository;

@RestController
@CrossOrigin
public class PageRestController {

	@Autowired
	private PageRepository repository;

	@RequestMapping(value = "website/pages", method = RequestMethod.GET)
	public ResponseEntity<List<Page>> getPages() {
		List<Page> result = this.repository.findAll();

		if (result.isEmpty()) {
			return new ResponseEntity<List<Page>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Page>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "website/pages/{id}", method = RequestMethod.GET)
	public ResponseEntity<Page> getPageById(@PathVariable("id") long id) {
		Optional<Page> result = this.repository.findById(id);

		if (result.isEmpty()) {
			return new ResponseEntity<Page>(HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<Page>(result.get(), HttpStatus.OK);
	}
	
	//add website to search after .com/.gov with dropdown
	@RequestMapping(value = "website/pages/name/{name}", method = RequestMethod.GET)
	public ResponseEntity<List<Page>> getPageByName(@PathVariable("name") String name) {
		List<Page> result = this.repository.findPageByName(name);

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Page>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Page>>(HttpStatus.NOT_FOUND);
		}
	}
	
	//add website to search after german/italian... with dropdown
	@RequestMapping(value = "website/pages/language/{language}", method = RequestMethod.GET)
	public ResponseEntity<List<Page>> getPageByLanguage(@PathVariable("language") String language) {
		List<Page> result = this.repository.findPageByLanguage(language);

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Page>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Page>>(HttpStatus.NOT_FOUND);
		}
	}
	
	@RequestMapping(value = "website/pages/byProvison/dateFrom/{date}", method = RequestMethod.GET)
	public ResponseEntity<List<Page>> getPageByProvisionDateFrom(@PathVariable("date") Date date) {
		List<Page> result = this.repository.findPageByProvisionDateFrom(date);

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Page>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Page>>(HttpStatus.NOT_FOUND);
		}
	}
	
	@RequestMapping(value = "website/pages/byProvison/dateTo/{date}", method = RequestMethod.GET)
	public ResponseEntity<List<Page>> getPageByProvisionDateTO(@PathVariable("date") Date date) {
		List<Page> result = this.repository.findPageByProvisionDateTo(date);

		if (!result.isEmpty()) {
			return new ResponseEntity<List<Page>>(result, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<Page>>(HttpStatus.NOT_FOUND);
		}
	}
	
	@RequestMapping(value = "website/pages", method = RequestMethod.POST)
	public ResponseEntity<Page> createPage(@RequestBody PageRequest pageRequest) {

		try {
			//Customer customer = this.repositoryCustomer.findById(diaryRequest.customer_id).get();
			Page result = this.repository.save(new Page(pageRequest.language, pageRequest.name));
			return new ResponseEntity<Page>(result, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<Page>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}
	
	@RequestMapping(value = "website/pages/{id}", method = RequestMethod.DELETE)
	public ResponseEntity<String> deletePageById(@PathVariable("id") long id, RedirectAttributes redirAttrs) {
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
