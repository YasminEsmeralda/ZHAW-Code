package ch.zhaw.springboot.restcontroller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import ch.zhaw.springboot.entities.Expense;
import ch.zhaw.springboot.entities.Person;
import ch.zhaw.springboot.repositories.ExpenseRepository;
import ch.zhaw.springboot.repositories.PersonRepository;

@RestController
public class ExpenseRestController {
	
	@Autowired
	private ExpenseRepository repository;
	
	@Autowired
	private PersonRepository personRepository;
	
	@RequestMapping(value = "expenses/expenses", method = RequestMethod.GET)
	public ResponseEntity<List<Expense>> getExpenses() {
		List<Expense> result = this.repository.findAll();
		
		if (result.isEmpty()) {
			return new ResponseEntity<List<Expense>>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<List<Expense>>(result, HttpStatus.OK);
	}

	@RequestMapping(value = "expenses/expenses/{id}", method = RequestMethod.GET)
	public ResponseEntity<Expense> getExpensesById(@PathVariable("id") long id) {
		Optional<Expense> result = this.repository.findById(id);
		
		if (result.isEmpty()) {
			return new ResponseEntity<Expense>(HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<Expense>(result.get(), HttpStatus.OK);
	}
	
	@RequestMapping(value = "expenses/expenses/personByCategory/{category}", method = RequestMethod.GET)
	public ResponseEntity<List<Person>> getPersonByExpenseCategory(@PathVariable("category") String category) {
		if (this.repository.countByCategory(category) < 1) {
			return new ResponseEntity<List<Person>>(HttpStatus.NOT_FOUND);
		}
		
		List<Person> result = this.repository.getPersonsByCategory(category);
		
		return new ResponseEntity<List<Person>>(result, HttpStatus.OK);
	}
	
	@RequestMapping(value = "expenses/expenses/count/{category}", method = RequestMethod.GET)
	public ResponseEntity<Integer> countCategory(@PathVariable("category") String category) {
		
		int result = this.repository.countByCategory(category);
		
		return new ResponseEntity<Integer>(result, HttpStatus.OK);
	}
	
	@PostMapping("expenses/expenses")
	public ResponseEntity<Expense> createExpense(@RequestBody Expense newExpense) {
		Expense result = this.repository.save(newExpense);
		
		return new ResponseEntity<Expense>(result, HttpStatus.OK);
	}
	
	/* Variante 1: Expense mit Person verbinden
	 * @PostMapping("expenses/expenses/{person}")
	 * public ResponseEntity<Expense> createExpenseByPersonID(@RequestBody Expense newExpense, @PathVariable long person) {
	 * 	Person person1 = this.personRepository.findById(person);
	 * 	Expense result = this.repository.save(newExpense);
	 * 	return new ResponseEntity<Expense>(result, HttpStatus.OK);
	 * }
	 */
	
	/* Variante 2: Zwischenklasse CLientExpense einbauen und in dieser Klasse die Verknüpfung machen
	 * @PostMapping("expenses/expenses")
	 * public ResponseEntity<Expense> createExpenseByPersonID(@RequestBody ClientExpense newExpense) {
	 * 	// Model einabauen
	 * 	Expense result = this.repository.save(newExpense);
	 * 	return new ResponseEntity<Expense>(result, HttpStatus.OK);
	 * }
	 */

}

