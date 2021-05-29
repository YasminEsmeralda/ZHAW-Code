Select e.Name as Name
      ,e.birthdate as Birthdate
      ,concat(e.salary, ' USD') as Salary
      ,e.hiredSince as Since
      ,c.name as Company
      ,p.name as PK
 from infom_project_4.company as c
 join infom_project_4.employee as e
   on e.fk_companyId = c.pk_companyId
 join infom_project_4.pensionFund as p
   on e.fk_pensionFundId = p.pk_pensionFundId
 where e.birthdate between '1970-01-01' and '1972-07-31'
order by e.pk_employeeid
;