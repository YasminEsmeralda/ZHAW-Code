package ch.zhaw.springboot.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import ch.zhaw.springboot.entities.Navigation;

public interface NavigationRepository extends JpaRepository<Navigation, Long> {
	
//	@Query("SELECT n FROM Navigation n, Item i WHERE TYPE(i)")

}
