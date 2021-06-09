package ch.zhaw.springboot.repositories;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import ch.zhaw.springboot.entities.Provision;

public interface ProvisionRepository extends JpaRepository<Provision, Long> {
	
	@Query("SELECT p FROM Provision p WHERE ?1 BETWEEN p.dateFrom AND p.dateTo")
	public List<Provision> findProvisionByRange(Date date);
}
