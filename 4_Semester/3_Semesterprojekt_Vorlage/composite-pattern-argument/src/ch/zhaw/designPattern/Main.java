package ch.zhaw.designPattern;

public class Main {

	public static void main(String[] args) {
		
		System.out.println("> Hello :-)");
		
		Number one = new Number(1);
		Number three = new Number(3);
		
		Operation plusOneThree = new Operation("+", one, three);
		
		Number nine = new Number(9);
		
		Operation plusOneThreeNine = new Operation("+", nine, plusOneThree);
		
		Operation plusOneThreeNineOneThree = new Operation("+", plusOneThreeNine, plusOneThree);
		
		System.out.println(one + " = " + one.compute());
			
		System.out.println(plusOneThree + " = " + plusOneThree.compute());
	
		
		System.out.println(plusOneThreeNine + " = " + plusOneThreeNine.compute());
		
		System.out.println(plusOneThreeNineOneThree + " = " + plusOneThreeNineOneThree.compute());
	
		
	}

	
}
