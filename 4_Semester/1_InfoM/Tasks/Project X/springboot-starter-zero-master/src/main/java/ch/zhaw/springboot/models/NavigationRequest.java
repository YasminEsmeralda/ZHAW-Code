package ch.zhaw.springboot.models;

public class NavigationRequest {

	public int type;
	public String layout;
	public String label;
	public int ctrViews;
	public long menu_id;
	
	//Constructor for Menu without menu as Parent
	public NavigationRequest(int type, String layout, String label) {
		this.type = type;
		this.layout = layout;
		this.label = label;
	}
	
	//Constructor for Menu with menu as Parent
	public NavigationRequest(int type, String layout, String label, long menu_id) {
		this.type = type;
		this.layout = layout;
		this.label = label;
		this.menu_id = menu_id;
	}
	
	//Constructor for Items
	public NavigationRequest(int type, String layout, int ctrViews, long menu_id) {
		this.type = type;
		this.layout = layout;
		this.ctrViews = ctrViews;
		this.menu_id = menu_id;
	}
}
