package ch.zhaw.springboot.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import ch.zhaw.springboot.entities.Menu;

public interface MenuRepository extends JpaRepository<Menu, Long> {

}
