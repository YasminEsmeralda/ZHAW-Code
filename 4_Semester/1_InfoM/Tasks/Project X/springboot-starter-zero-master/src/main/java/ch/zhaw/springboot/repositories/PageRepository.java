package ch.zhaw.springboot.repositories;

import java.sql.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import ch.zhaw.springboot.entities.Page;

public interface PageRepository extends JpaRepository<Page, Long> {
	
	@Query("SELECT p FROM Page p WHERE p.name Like %?1%") 
	public List<Page> findPageByName(String name);
	
	@Query("SELECT p FROM Page p WHERE p.language Like %?1%") 
	public List<Page> findPageByLanguage(String name);
	
	@Query("SELECT p.name FROM Page p, Provision ps WHERE p.id = ps.page AND ps.dateFrom = ?1")
	public List<Page> findPageByProvisionDateFrom (Date dateFrom);
	
	@Query("SELECT p.name FROM Page p, Provision ps WHERE p.id = ps.page AND ps.dateTo = ?1")
	public List<Page> findPageByProvisionDateTo (Date dateTo);
}
