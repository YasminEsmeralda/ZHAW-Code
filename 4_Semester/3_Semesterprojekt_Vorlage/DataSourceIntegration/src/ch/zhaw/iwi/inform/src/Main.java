package ch.zhaw.iwi.inform.src;

import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.opencsv.CSVReader;

/**
 * 
 * @author yluet
 * links:
 * - https://www.kaggle.com/mit/pantheon-project?select=database.csv
 * - https://jar-download.com/download-handling.php
 * - https://attacomsian.com/blog/gson-read-json-file
 * 
 * downloads:
 * - http://opencsv.sourceforge.net/#reading_into_an_array_of_strings
 * - https://jar-download.com/artifacts/com.google.code.gson/gson/2.8.2/source-code
 *
 */
public class Main {

	public static void main(String[] args) throws IOException {
		System.out.println("> Hello :-)");
		
		List<Person> persons = Main.readFromCsv();
		Main.completeUsingWikipedia(persons);
		
		for(Person current: persons) {
			System.out.println(current);
		}
		
	}
	
	public static void completeUsingWikipedia(List<Person> persons) throws IOException {
		String nameUrlEncoded;
		
		//TODO remove -> only for testing
		long pageId;
		String extract;
		
		for (Person current: persons) {
			//Variante: hier sql insert statement schreiben
			System.out.println("> Fetching from Wikipedia for person: " + current.getName());
			
			pageId = Main.retrievePageId(current.getName());
			if (pageId > 0) {
				extract = Main.retrieveExtract(pageId);
				current.setDescription(extract);
			}

		}
	}
	
	private static String retrieveExtract(long pageId) throws IOException {
		String url = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&pageids="
				+ pageId + "&exsentences=" + 3 + "&explaintext=1";
		
		InputStream iS = new URL(url).openStream();
		Reader reader = new InputStreamReader(iS, StandardCharsets.UTF_8);
		
		Gson gson = new Gson();
		Map<String, Object> deserialised = gson.fromJson(reader, Map.class);
		Map<String, Object>	query = (Map<String, Object>) deserialised.get("query");
		Map<String, Object> pages = (Map<String, Object>) query.get("pages");
		Map<String, Object> page = (Map<String, Object>) pages.get(Long.toString(pageId));
		String extract = (String) page.get("extract");
		
		return extract;
	}
	
	private static long retrievePageId(String searchString) throws IOException {
		String nameUrlEncoded = URLEncoder.encode(searchString, StandardCharsets.UTF_8.toString());
		String url = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&list=search&srsearch="
				+ nameUrlEncoded + "&format=json";

		Gson gson = new Gson();
		
		InputStream iS = new URL(url).openStream();
		Reader reader = new InputStreamReader(iS);
		Map<String, Object> deserialised = gson.fromJson(reader, Map.class);
		Map<String, Object> query = (Map<String, Object>) deserialised.get("query");
		List<Object> search = (List<Object>) query.get("search");
		Map<String, Object> firstHit = (Map<String, Object>) search.get(0);
		Double pageIdDouble = (Double) firstHit.get("pageid");
		long result = pageIdDouble.longValue();
		
		return result;
	}
	
	public static List<Person> readFromCsv() throws IOException{
		CSVReader reader = new CSVReader(new FileReader("resources/database.csv"));
		String[] line = reader.readNext();
		
		List<Person> persons = new ArrayList<Person>();
		
		Person current;
		boolean toBeAdded;
		//bereits zweite Zeile rauslesen -> Titelspalte überspringen
		while((line = reader.readNext()) != null) {
			toBeAdded = true;
			current = new Person(line[1], line[6], line[10]);
			
			//Derterminierung des Geschlechts
			if (line[2].equalsIgnoreCase("female")) {
				current.setGender("f");
			} else if (line[2].equalsIgnoreCase("male")) {
				current.setGender("m");
			} else {
				current.setGender("");
				toBeAdded = false;
				System.out.println("> Problem extracting gender for person: " + current.getName() + line[2]);
			}
			
			//Derterminierung des Geburtsjahr
			try {
				current.setBirthyear(Integer.parseInt(line[3]));
			} catch (NumberFormatException e) {
				current.setBirthyear(Integer.MAX_VALUE);
				toBeAdded = false;
				System.out.println("> Problem extracting birthyear for person: " + current.getName() + e.getMessage());
			}
			
			if (toBeAdded) { 
				persons.add(current);
			}

		}
		
		System.out.println(persons.size());
		return persons;
	}

}
