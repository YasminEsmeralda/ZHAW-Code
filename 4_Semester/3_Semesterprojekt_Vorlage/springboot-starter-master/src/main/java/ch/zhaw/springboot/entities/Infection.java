package ch.zhaw.springboot.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@Entity
public class Infection {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	private long time;
	private String location;

	@ManyToOne
	private Person person;
	@ManyToOne
	private Pathogen pathogen;

	public Infection(long time, String location, Person person, Pathogen pathogen) {
		this.time = time;
		this.location = location;
		this.person = person;
		this.pathogen = pathogen;
	}

	public Infection() {
	}

	public long getId() {
		return this.id;
	}

	public long getTime() {
		return this.time;
	}

	public String getLocation() {
		return this.location;
	}

	public Person getPerson() {
		return this.person;
	}

	public Pathogen getPathogen() {
		return this.pathogen;
	}
}
