package ch.zhaw.springboot.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import ch.zhaw.springboot.entities.Person;

public interface PersonRepository extends JpaRepository<Person, Long> {

}
