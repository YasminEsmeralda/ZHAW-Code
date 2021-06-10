package ch.zhaw.springboot.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import ch.zhaw.springboot.entities.Item;
import ch.zhaw.springboot.entities.Navigation;

public interface ItemRepository extends JpaRepository<Item, Long> {
	
	@Query("SELECT n FROM Navigation n WHERE n.ctrViews <= ?1") 
	public List<Item> findViewsLessThan(int views);
	
	@Query("SELECT n FROM Navigation n WHERE n.ctrViews >= ?1") 
	public List<Item> findViewsGreaterThan(int views);
	
	@Query("SELECT i FROM Item i")
	List<Navigation> getNavigationItem();
}
