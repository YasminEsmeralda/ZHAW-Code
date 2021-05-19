
public class DialogElement {
	
	private String speaker;
	private String speech;

	public DialogElement(String speaker, String speech) {
		this.speaker = speaker;
		this.speech = speech;
	}

	public String getSpeaker() {
		return this.speaker;
	}

	public String getSpeech() {
		return this.speech;
	}
	
	@Override
	public String toString() {
		return this.getSpeaker() + ": " + this.getSpeech();
	}

}
