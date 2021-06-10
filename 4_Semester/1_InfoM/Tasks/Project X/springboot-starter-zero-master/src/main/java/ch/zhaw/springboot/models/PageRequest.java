package ch.zhaw.springboot.models;

public class PageRequest {

	public String language;
	public String name;
	
	public PageRequest(String language, String name) {
		this.language = language;
		this.name = name;
	}
	
}
