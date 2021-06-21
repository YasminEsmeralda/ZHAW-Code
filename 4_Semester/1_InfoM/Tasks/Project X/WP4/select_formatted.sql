select p.name as "Website Name"
	  ,p.language as Language
 --     ,concat("valid from ", ps.date_from, " until ", ps.date_to) as Period
	  ,concat(ps.date_from, " -> ", ps.date_to) as Period
      ,n.navigation_type as Navigation
      ,n.layout as Layout
      ,ifnull(n.label, n.number_of_views) as Navigationinfo
  from website.page as p
  join website.provision as ps
    on ps.fk_page_id = p.pk_page_id
  join website.navigation as n
    on ps.fk_navigation_id = n.pk_navigation_id
-- where 
-- group by p.pk_page_id
-- group by p.name, Navigation
 order by p.pk_page_id, Period
-- order by Period
;