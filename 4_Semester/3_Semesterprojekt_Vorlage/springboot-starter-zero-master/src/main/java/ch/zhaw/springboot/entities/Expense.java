package ch.zhaw.springboot.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Expense {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	private double amount;
	private long time;
	private String location;
	private String what;
	
	public Expense() {}

	public Expense(double amount, long time, String location, String what) {
		this.amount = amount;
		this.time = time;
		this.location = location;
		this.what = what;
	}

	public long getId() {
		return this.id;
	}

	public double getAmount() {
		return this.amount;
	}

	public long getTime() {
		return this.time;
	}

	public String getLocation() {
		return this.location;
	}

	public String getWhat() {
		return this.what;
	}
	
}
