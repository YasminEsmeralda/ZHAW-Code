package ch.zhaw.springboot.entities;

import java.sql.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity(name = "Provision")
@Table(name = "provision")
public class Provision {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_provision_id")
	private long id;
	
	@Column(name = "date_from")
	private Date dateFrom;
	
	@Column(name = "date_to")
	private Date dateTo;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "fk_page_id")
	private Page page;	
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "fk_navigation_id")
	private Navigation navigation;
	
	public Provision() {
	
	}

	public Provision(Date dateFrom, Date dateTo, Page page, Navigation navigation) {
		this.dateFrom = dateFrom;
		this.dateTo = dateTo;
		this.page = page;
		this.navigation = navigation;
	}

	public Date getDateFrom() {
		return dateFrom;
	}

	public void setDateFrom(Date dateFrom) {
		this.dateFrom = dateFrom;
	}

	public Date getDateTo() {
		return dateTo;
	}

	public void setDateTo(Date dateTo) {
		this.dateTo = dateTo;
	}

	public long getId() {
		return id;
	}
}
