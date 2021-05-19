package ch.zhaw.springboot.entities;

import javax.persistence.Entity;

@Entity
public class Lecturer extends Person{
	
	//Id ist bereits im Supertyp vorhanden
	
	private String office;

	public Lecturer() {
		super();
	}
	
	public Lecturer(String name, long birthdate, String office) {
		super(name, birthdate);
		this.office = office;
	}
	
	public String getOffice() {
		return this.office;
	}
	
}
