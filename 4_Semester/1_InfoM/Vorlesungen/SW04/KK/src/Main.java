import java.awt.Dialog;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class Main {

	public static void main(String[] args) throws IOException {
		System.out.println("> Hello <");
		
		Document source = Jsoup.connect("http://shakespeare.mit.edu/romeo_juliet/full.html").get();
		
		System.out.println(source.title() + "\n");
		
		Elements links = source.select("a[name^=speech]");
		List<DialogElement> dialogElements = new ArrayList<DialogElement>();
		String speaker;
		String speech;
		for (Element current : links) {
			speaker = current.select("b").first().text();
			speech = current.nextElementSibling().text();
			dialogElements.add(new DialogElement(speaker, speech));
		}
		
		List<DialogElementPair> dialogElementPairs = new ArrayList<DialogElementPair>();
		for (int i = 0; i < dialogElements.size() - 1; i++) {
			dialogElementPairs.add(new DialogElementPair(dialogElements.get(i), dialogElements.get(i + 1)));
		}
		
		for (DialogElementPair dialogElementPair : dialogElementPairs) {
			if (dialogElementPair.getSecond().getSpeaker().equalsIgnoreCase("romeo")) {
				System.out.println(dialogElementPair);
			}
		}
		
		System.out.println(dialogElementPairs.size());
	}

}
