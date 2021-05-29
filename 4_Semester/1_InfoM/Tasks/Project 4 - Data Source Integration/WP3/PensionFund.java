package ch.zhaw.infoM.project4.src;

public class PensionFund {
	
	private int id;
	private String name;
	private double prize;
	
	public PensionFund() {
		
	}

	public PensionFund(int id, String name, double prize) {
		super();
		this.id = id;
		this.name = name;
		this.prize = prize;
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

	public double getPrize() {
		return this.prize;
	}

	public void setPrize(double prize) {
		this.prize = prize;
	}

	@Override
	public String toString() {
		return ",(" + this.getId() + 
			   ", \"" + this.getName() + 
			   "\", \"" + this.getPrize() + "\")" + "\n"
			;
	}
}