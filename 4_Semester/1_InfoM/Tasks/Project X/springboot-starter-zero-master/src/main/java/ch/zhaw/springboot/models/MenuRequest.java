package ch.zhaw.springboot.models;

import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping
public class MenuRequest {

	public String layout;
	public String label;
	public long menu_id;
	final int type = 1;
	
	//Constructor for Menu without menu as Parent
	public MenuRequest(String layout, String label) {
		this.layout = layout;
		this.label = label;
	}
	
	//Constructor for Menu with menu as Parent
	public MenuRequest(String layout, String label, long menu_id) {
		this.layout = layout;
		this.label = label;
		this.menu_id = menu_id;
	}
}
