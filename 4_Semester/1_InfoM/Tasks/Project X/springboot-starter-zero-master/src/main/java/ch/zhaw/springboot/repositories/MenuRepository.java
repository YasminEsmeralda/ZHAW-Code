package ch.zhaw.springboot.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import ch.zhaw.springboot.entities.Menu;
import ch.zhaw.springboot.entities.Navigation;

public interface MenuRepository extends JpaRepository<Menu, Long> {
	
	@Query("SELECT m FROM Menu m")
	List<Navigation> getNavigationMenu();
	
}
