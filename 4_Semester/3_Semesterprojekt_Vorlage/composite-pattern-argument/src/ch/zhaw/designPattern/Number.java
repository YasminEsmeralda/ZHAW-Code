package ch.zhaw.designPattern;

public class Number extends Argument {

	private int value;

	public Number(int value) {
		this.value = value;
	}

	public int getValue() {
		return this.value;
	}
	
	public int compute() {
		return this.value;
	}
	
	public String toString() {
		return Integer.toString(this.value);
	}
	
}
