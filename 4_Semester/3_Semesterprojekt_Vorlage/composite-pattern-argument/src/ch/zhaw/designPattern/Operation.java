package ch.zhaw.designPattern;

public class Operation extends Argument {

	private String symbol; //+, -, *, :
	
	private Argument lhs;
	private Argument rhs;
	
	
	public Operation(String symbol, Argument lhs, Argument rhs) {
			this.symbol = symbol;
			this.lhs = lhs;
			this.rhs = rhs;
	}


	public String getSymbol() {
		return this.symbol;
	}


	public Argument getLhs() {
		return lhs;
	}


	public Argument getRhs() {
		return rhs;
	}
	
	
	public int compute() {
		return this.lhs.compute() + this.rhs.compute();
	}
	
	public String toString() {
		String result = "";
		
		result += "(";
		result += this.lhs;
		result += this.symbol;
		result += this.rhs;
		result += ")";
		
		return result;
	}
	
	
}
