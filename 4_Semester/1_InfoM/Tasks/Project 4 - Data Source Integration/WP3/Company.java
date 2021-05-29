package ch.zhaw.infoM.project4.src;

public class Company {
	
	private int id;
	private String industry;
	private String name;
	private boolean firstCall;
	
	public Company() {
		
	}

	public Company(int id, String industry, String name) {
		this.id = id;
		this.industry = industry;
		this.name = name;
	}
	
	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getIndustry() {
		return this.industry;
	}

	public void setIndustry(String industry) {
		this.industry = industry;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public boolean isFirstCall() {
		return this.firstCall;
	}

	public void setFirstCall(boolean firstCall) {
		this.firstCall = firstCall;
	}

	@Override
	public String toString() {
		return ",(" + this.getId() + 
			   ", \"" + this.getName() + 
			   "\", \"" + this.getIndustry() + "\")" + "\n"
			;
	}
}
