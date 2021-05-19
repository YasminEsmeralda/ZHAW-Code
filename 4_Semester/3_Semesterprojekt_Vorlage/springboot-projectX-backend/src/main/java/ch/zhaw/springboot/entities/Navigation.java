package ch.zhaw.springboot.entities;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;

@Entity
public class Navigation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	private String name;
	
	@OneToMany
	private List<Provision> expenses;
	
	//default constructor 
	public Navigation() {
		this.expenses = new ArrayList<Provision>();
	}

	public Navigation(String name) {
		this.name = name;
		this.expenses = new ArrayList<Provision>();
	}

	public String getName() {
		return this.name;
	}

}
