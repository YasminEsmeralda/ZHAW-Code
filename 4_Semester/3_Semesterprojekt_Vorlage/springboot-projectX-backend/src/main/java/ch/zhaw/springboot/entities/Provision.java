package ch.zhaw.springboot.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Provision {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	private String name;
	
	//default constructor 
	public Provision() {

	}

	public Provision(String name) {
		this.name = name;
	}

	public String getName() {
		return this.name;
	}

}
