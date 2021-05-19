
public class File extends Node{
	
	private String content;
	
	public File(String name, String content) {
		super(name);
		this.content = content;
	}

	public String getContent() {
		return this.content;
	}

	public void setContent(String content) {
		this.content = content;
	}
	
	@Override
	public String toString() {
		return "<file><name>" + this.getName() + "</name><content>" + this.getContent() + "</content></file>";
	}

}
