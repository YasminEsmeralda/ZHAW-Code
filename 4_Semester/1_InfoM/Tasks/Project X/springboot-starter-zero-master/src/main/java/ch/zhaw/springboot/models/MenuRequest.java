package ch.zhaw.springboot.models;

public class MenuRequest {

	public String layout;
	public String label;
	public long menu_id;
	
	//Constructor for Menu without menu as Parent
	public MenuRequest(String layout, String label) {
		this.layout = layout;
		this.label = label;
	}
	
	//Constructor for Menu with menu as Parent
	public MenuRequest(int type, String layout, String label, long menu_id) {
		this.layout = layout;
		this.label = label;
		this.menu_id = menu_id;
	}
}
