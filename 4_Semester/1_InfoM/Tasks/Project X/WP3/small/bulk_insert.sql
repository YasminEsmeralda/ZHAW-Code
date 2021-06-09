insert into website.page (pk_page_id, language, name) values (1, 'Catalan', 'msn.com');
insert into website.page (pk_page_id, language, name) values (2, 'Bulgarian', 'live.com');
insert into website.page (pk_page_id, language, name) values (3, 'Zulu', 'nps.gov');
insert into website.page (pk_page_id, language, name) values (4, 'Oriya', 'whitehouse.gov');
insert into website.page (pk_page_id, language, name) values (5, 'Fijian', 'shutterfly.com');
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (1, '2005-07-22', '2015-06-01', 7, 5);
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (2, '2004-05-08', '2015-10-16', 2, 4);
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (3, '2005-05-17', '2012-07-01', 4, 3);
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (4, '2006-11-19', '2011-12-15', 9, 4);
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (5, '2005-06-07', '2019-10-22', 1, 2);
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (6, '2002-05-05', '2014-11-19', 1, 3);
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (7, '2006-08-11', '2019-06-27', 9, 1);
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (8, '2006-07-17', '2013-07-30', 3, 5);
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (9, '2006-07-27', '2015-07-30', 7, 4);
insert into website.provision (pk_provision_id, date_from, date_to, fk_navigation_id, fk_page_id) values (10, '2005-08-28', '2011-02-26', 3, 4);
insert into website.navigation (navigation_type, pk_navigation_id, layout, label) values (1, 1, 'body', 'Outdoors');
insert into website.navigation (navigation_type, pk_navigation_id, layout, label) values (1, 2, 'tabelle', 'Electronics');
insert into website.navigation (navigation_type, pk_navigation_id, layout, label) values (1, 3, 'text', 'Games');
insert into website.navigation (navigation_type, pk_navigation_id, layout, label, fk_menu_id) values (1, 4, 'link', 'Kids', 3);
insert into website.navigation (navigation_type, pk_navigation_id, layout, label, fk_menu_id) values (1, 5, 'titel', 'Shoes', 3);
insert into website.navigation (navigation_type, pk_navigation_id, layout, label, fk_menu_id) values (1, 6, 'text', 'Home', 4);
insert into website.navigation (navigation_type, pk_navigation_id, layout, label, fk_menu_id) values (1, 7, 'titel', 'Health', 5);
insert into website.navigation (navigation_type, pk_navigation_id, layout, label, fk_menu_id) values (1, 8, 'text', 'Jewelry', 4);
insert into website.navigation (navigation_type, pk_navigation_id, layout, label, fk_menu_id) values (1, 9, 'button', 'Home', 7);
insert into website.navigation (navigation_type, pk_navigation_id, layout, label, fk_menu_id) values (1, 10, 'tabelle', 'Shoes', 6);
insert into website.navigation (navigation_type, pk_navigation_id, layout, number_of_views, fk_menu_id) values (2, 11, 'text', 97881, 4);
insert into website.navigation (navigation_type, pk_navigation_id, layout, number_of_views, fk_menu_id) values (2, 12, 'titel', 59703, 3);
insert into website.navigation (navigation_type, pk_navigation_id, layout, number_of_views, fk_menu_id) values (2, 13, 'text', 82076, 5);
insert into website.navigation (navigation_type, pk_navigation_id, layout, number_of_views, fk_menu_id) values (2, 14, 'link', 88311, 3);
insert into website.navigation (navigation_type, pk_navigation_id, layout, number_of_views, fk_menu_id) values (2, 15, 'tabelle', 65076, 9);
