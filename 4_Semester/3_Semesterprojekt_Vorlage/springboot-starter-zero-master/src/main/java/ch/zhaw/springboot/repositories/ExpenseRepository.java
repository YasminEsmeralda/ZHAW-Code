package ch.zhaw.springboot.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import ch.zhaw.springboot.entities.Expense;
import ch.zhaw.springboot.entities.Person;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
	
	@Query("SELECT p FROM Person p, Expense e WHERE e.what LIKE ?1% AND e MEMBER OF p.expenses")
	public List<Person> getPersonsByCategory(String category);
	
	@Query("SELECT COUNT(*) FROM Expense e WHERE e.what LIKE ?1% ")
	public int countByCategory(String category);
	
	//devived queries what = attribut der entity Expense
	//wird nicht gehen, weil wir mit LIKE gearbeitet haben und nicht ganzer String
	//public int countByWhat(String category);
}