package ch.zhaw.springboot.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import ch.zhaw.springboot.entities.Provision;

public interface ProvisionRepository extends JpaRepository<Provision, Long> {

}
