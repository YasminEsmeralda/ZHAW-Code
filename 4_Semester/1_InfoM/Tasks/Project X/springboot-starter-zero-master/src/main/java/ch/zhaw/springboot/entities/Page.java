package ch.zhaw.springboot.entities;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity(name = "Page")
@Table(name = "page")
public class Page {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "pk_page_id")
	private long id;
	
	@Column(name = "language", length = 50)
	private String language;
	
	@Column(name = "name", length = 150)
	private String name;
	
	@OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
	@JoinColumn(name = "fk_page_id")
	private List<Provision> provisions;
	
	public Page() {
		this.provisions = new ArrayList<Provision>();
	}

	public Page(String language, String name) {
		this.language = language;
		this.name = name;
		this.provisions = new ArrayList<Provision>();
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<Provision> getProvisions() {
		return provisions;
	}

	public void setProvisions(List<Provision> provisions) {
		this.provisions = provisions;
	}

	public long getId() {
		return id;
	}
}
