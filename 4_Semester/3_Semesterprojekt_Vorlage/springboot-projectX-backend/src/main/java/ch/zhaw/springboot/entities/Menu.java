package ch.zhaw.springboot.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Menu extends Navigation{

	private String name;
	
	//default constructor 
	public Menu() {
		super();
	}

	public Menu(String name) {
		super(name);
		this.name = name;
	}

	public String getName() {
		return this.name;
	}

}
