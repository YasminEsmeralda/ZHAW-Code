package ch.zhaw.designPattern;

public class File extends Node{
	
	private String value;

	public File(String name, String value) {
		super(name);
		this.value = value;
	}

	public String getValue() {
		return value;
	}
	
	public String toString() {
		String result = "";
		
		result += "\t" + "<" + this.getName() + ">";
		result += this.getValue();
		result += "\t" + "</" + this.getName() + ">";
		
		return result;
		//return super.toString();
	}

}
