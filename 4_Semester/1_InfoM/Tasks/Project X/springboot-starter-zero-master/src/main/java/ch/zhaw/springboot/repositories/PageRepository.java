package ch.zhaw.springboot.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import ch.zhaw.springboot.entities.Page;

public interface PageRepository extends JpaRepository<Page, Long> {

}
