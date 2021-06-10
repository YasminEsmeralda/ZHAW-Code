package ch.zhaw.springboot.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import ch.zhaw.springboot.entities.Navigation;

public interface NavigationRepository extends JpaRepository<Navigation, Long> {
	
//	@Query("SELECT n FROM Navigation n, Item i WHERE TYPE(i)")

}
