package ch.zhaw.springboot.entities;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity(name = "Item")
@Table(name = "item")
@DiscriminatorValue("2")
public class Item extends Navigation{
	
	@Column(name = "number_of_views")
	private int ctrViews;
	
	public Item() {
		super();
	}
	
	public Item(String layout, int ctrViews) {
		super(layout);
		this.ctrViews = ctrViews;
	}
	
	public int getCtrViews() {
		return ctrViews;
	}

	public void setCtrViews(int ctrViews) {
		this.ctrViews = ctrViews;
	}
}
