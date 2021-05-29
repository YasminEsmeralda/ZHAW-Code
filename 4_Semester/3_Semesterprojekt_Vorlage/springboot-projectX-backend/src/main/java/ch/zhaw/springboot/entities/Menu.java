package ch.zhaw.springboot.entities;

import java.util.List;

import javax.persistence.Entity;

@Entity
public class Menu extends Navigation{

	private String name;
	
	//mehrwertig
	private List<Navigation> children;
		
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
