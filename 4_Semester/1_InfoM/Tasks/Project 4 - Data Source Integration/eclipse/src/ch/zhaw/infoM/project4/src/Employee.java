package ch.zhaw.infoM.project4.src;

import java.util.Date;

public class Employee {
	
	private int id;
	private String name;
	private double salary;
	private String birthdate;
	private int hiredSince;
	private int idCompany;
	private int idPensionFund;
	
	public Employee() {
		
	}

	public Employee(int id, String name, double salary, String birthdate, int hiredSince, int idCompany, int idPensionFund) {
		this.id = id;
		this.name = name;
		this.salary = salary;
		this.birthdate = birthdate;
		this.hiredSince = hiredSince;
		this.idCompany = idCompany;
		this.idPensionFund = idPensionFund;
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public double getSalary() {
		return this.salary;
	}

	public void setSalary(double salary) {
		this.salary = salary;
	}

	public String getBirthdate() {
		return this.birthdate;
	}

	public void setBirthdate(String birthdate) {
		this.birthdate = birthdate;
	}

	public int getHiredSince() {
		return this.hiredSince;
	}

	public void setHiredSince(int hiredSince) {
		this.hiredSince = hiredSince;
	}

	public int getIdCompany() {
		return this.idCompany;
	}

	public void setIdCompany(int idCompany) {
		this.idCompany = idCompany;
	}

	public int getIdPensionFund() {
		return this.idPensionFund;
	}

	public void setIdPensionFund(int idPensionFund) {
		this.idPensionFund = idPensionFund;
	}
	

	@Override
	public String toString() {
		return ",(" + this.getId() + 
			   ", \"" + this.getName() + 
			   "\", \"" + this.getSalary() +
			   "\", \"" + this.getBirthdate() + 
			   "\", \"" + this.getHiredSince() + 
			   "\", " + this.getIdCompany() + 
			   ", " + this.getIdPensionFund() + ")" + "\n"
			;
	}

}