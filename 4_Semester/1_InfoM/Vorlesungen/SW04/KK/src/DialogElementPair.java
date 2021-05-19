
public class DialogElementPair {

	private DialogElement first;
	private DialogElement second;

	public DialogElementPair(DialogElement first, DialogElement second) {
		this.first = first;
		this.second = second;
	}

	public DialogElement getFirst() {
		return this.first;
	}

	public DialogElement getSecond() {
		return this.second;
	}
	
	@Override
	public String toString() {
		return this.getFirst() + "\n" + this.getSecond() + "\n";  
	}
}
