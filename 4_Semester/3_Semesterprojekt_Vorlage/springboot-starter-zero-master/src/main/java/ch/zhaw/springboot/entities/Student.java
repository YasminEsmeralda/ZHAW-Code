package ch.zhaw.springboot.entities;

import javax.persistence.Entity;

@Entity
public class Student extends Person{
	
	//Id ist bereits im Supertyp vorhanden
	
	private String legiNr;

	public Student() {
		super();
	}
	
	public Student(String name, long birthdate, String legiNr) {
		super(name, birthdate);
		this.legiNr = legiNr;
	}
	
	public String getLegiNr() {
		return this.legiNr;
	}

}
