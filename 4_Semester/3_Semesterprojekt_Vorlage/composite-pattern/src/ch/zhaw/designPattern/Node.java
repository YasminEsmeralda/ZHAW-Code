package ch.zhaw.designPattern;

//superclass
public class Node {
	
	private String name;
	
	//zeigt auf Folder
	private Folder parent;

	public Node(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public Folder getParent() {
		return parent;
	}

	public void setParent(Folder parent) {
		this.parent = parent;
		parent.addChild(this);
	}
	
}
