import java.util.ArrayList;
import java.util.List;

public class Folder extends Node {

	private List<Node> children;

	public Folder(String name) {
		super(name);
		this.children = new ArrayList<Node>();
	}

	public void addChild(Node node) {
		this.children.add(node);
	}

	@Override
	public String toString() {
		String result = "<folder>";
		result += "<name>" + this.getName() + "</name>";
		result += "<children>";
		
		for (Node node : this.children) {
			result += node.toString();
		}
		
		result += "</children>";
		
		result += "</folder>";
		return result;
	}

}
