package ch.zhaw.springboot.entities;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;

import com.fasterxml.jackson.databind.PropertyNamingStrategy.LowerCaseStrategy;

@Entity
public class Person {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	//Springboot erstellt spalte dtype um zu sagen ob die Person ein Lecturer oder Student

	private String name;
	private long birthdate;
	
	@OneToMany
	private List<Expense> expenses;

	public Person(String name, long birthdate) {
		this.name = name;
		this.birthdate = birthdate;
		this.expenses = new ArrayList<Expense>();
	}

	public Person() {
		this.expenses = new ArrayList<Expense>();
	}

	public String getName() {
		return this.name;
	}

	public long getBirthdate() {
		return this.birthdate;
	}

	public List<Expense> getExpenses() {
		return this.expenses;
	}
	
	public long getId() {
		return this.id;
	}
	
	public double getTotalExpenses() {
		double result = 0.0;
		
		for (Expense current : this.expenses) {
			result += current.getAmount();
		}
		
		return result;
	}
	
	public double getTotalExpensesPerCategory(String category) {
		double result = 0.0;
		
		for (Expense current : this.expenses) {
			if(current.getWhat().toLowerCase().startsWith(category.toLowerCase())) {
				result += current.getAmount();
			}
		}
		
		return result;
	}
}
