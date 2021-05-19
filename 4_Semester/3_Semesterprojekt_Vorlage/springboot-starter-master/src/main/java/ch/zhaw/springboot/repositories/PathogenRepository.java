package ch.zhaw.springboot.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import ch.zhaw.springboot.entities.Pathogen;

public interface PathogenRepository extends JpaRepository<Pathogen, Long> {

}
