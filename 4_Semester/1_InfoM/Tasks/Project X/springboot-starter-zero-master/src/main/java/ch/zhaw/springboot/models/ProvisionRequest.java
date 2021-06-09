package ch.zhaw.springboot.models;

import java.sql.Date;

public class ProvisionRequest {

	public Date dateFrom;
	public Date dateTo;
	public long page_id;
	public long navigation_id;
	
	public ProvisionRequest(Date dateFrom, Date dateTo, long page_id, long navigation_id) {
		super();
		this.dateFrom = dateFrom;
		this.dateTo = dateTo;
		this.page_id = page_id;
		this.navigation_id = navigation_id;
	}
	
}
