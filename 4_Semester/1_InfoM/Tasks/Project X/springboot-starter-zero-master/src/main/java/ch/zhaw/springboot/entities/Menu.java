package ch.zhaw.springboot.entities;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity(name = "Menu")
@Table(name = "menu")
@DiscriminatorValue("1")
public class Menu extends Navigation{
	
	@Column(name = "label", length = 25)
	private String label;
	
	@OneToMany(fetch = FetchType.LAZY)
	@JoinColumn(name = "fk_menu_id")
	private List<Navigation> navigations; // children
	
	public Menu() {
		super();
		this.navigations = new ArrayList<Navigation>();
	}

	public Menu(String layout, String label) {
		super(layout);
		this.label = label;
		this.navigations = new ArrayList<Navigation>();
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}
	
	public List<Navigation> getNavigations() {
		return navigations;
	}

	public void addChild(Navigation navigation) {
		if (navigation.getMenu() == null) {
			navigation.setMenu(this);
		}
		
		if (!this.navigations.contains(navigation)) {
			this.navigations.add(navigation);
		}
	}

}
