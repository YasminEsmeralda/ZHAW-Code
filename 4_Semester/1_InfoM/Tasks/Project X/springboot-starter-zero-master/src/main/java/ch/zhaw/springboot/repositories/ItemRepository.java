package ch.zhaw.springboot.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import ch.zhaw.springboot.entities.Item;

public interface ItemRepository extends JpaRepository<Item, Long> {
	
}
