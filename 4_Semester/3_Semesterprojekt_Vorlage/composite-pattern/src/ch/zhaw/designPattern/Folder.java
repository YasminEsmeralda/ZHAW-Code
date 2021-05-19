package ch.zhaw.designPattern;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Folder extends Node{
	
	//mehrwertig
	private List<Node> children;
	
	public Folder(String name) {
		super(name);
		this.children = new ArrayList<>();
	}
	
	public void addChild(Node child) {
				//Beziehung in beide Seiten erstellen
		if(child.getParent() == null) { 
			child.setParent(this);
		}
		
		if(!this.children.contains(child)) {
			this.children.add(child);
		}
	}
	
	public String toString() {
		String result = "";
		
		result +=  "[" + this.getName() + "]";
		
		for (Node current : this.children) {
			result += current.toString();
		}
		
		result +=  "[/" + this.getName() + "]";
		
		return result;
		//return super.toString();
	}
}