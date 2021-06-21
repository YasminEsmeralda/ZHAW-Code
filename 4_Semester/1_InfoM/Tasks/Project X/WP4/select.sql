select p.name as Website
  from website.page as p, website.provision ps
 where p.pk_page_id = ps.fk_page_id
   and ps.date_from = '2002-01-27'
--   and '2021-06-15' between ps.date_from and ps.date_to
;