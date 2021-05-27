package ch.zhaw.iwi.inform.src;

public class Person {
	
	private String name;
	private String gender;
	private int birthyear;
	private String country;
	private String occupation;
	private String description;
	
	public Person() {
	}

	public Person(String name, String country, String occupation) {
		this.name = name;
		this.country = country;
		this.occupation = occupation;
	}

	public String getGender() {
		return this.gender;
	}

	public void setGender(String gender) {
	this.gender = gender;}

	public int getBirthyear() {
		return this.birthyear;
	}

	public void setBirthyear(int birthyear) {
	this.birthyear = birthyear;}

	public String getName() {
		return this.name;
	}

	public String getCountry() {
		return this.country;
	}

	public String getOccupation() {
		return this.occupation;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	@Override
	public String toString() {
		return super.toString();
	}

}
