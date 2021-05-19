drop schema infom_project_2;
create schema infom_project_2 default character set utf16;

create table infom_project_2.person
	(pk_personId					int not null auto_increment	
    ,vorname						character(50) not null 		
    ,nachname						character(50) not null
    ,geschlecht						character(1) not null		-- M/F
    ,geburtstag						date not null 				
    ,adresse						character(100) not null		
    ,hausnummer						character(15) not null
    ,postleitzahl					int not null
    ,telNummer						character (20)				
	,primary key (pk_personId)
	)	
;

create table infom_project_2.unternehmen
	(pk_unternehmenId				int not null auto_increment
    ,u_name							character(100) not null
    ,adresse						character(100) not null		
    ,hausnummer						character(5) not null
    ,postleitzahl					int not null
    ,telNummer						character (20)				
    ,land							character(30) not null			
	,primary key (pk_unternehmenId)
	)	
;

create table infom_project_2.fahrzeug
	(pk_fahrzeugId					int not null auto_increment
    ,marke							character(50) not null		
    ,modell	                    	character(50) not null
    ,km_Stand                       int not null				
    ,nummerSchild                  	character(30)
    ,zulassung		               	character(50)
	,primary key (pk_fahrzeugId)
	)	
;

create table infom_project_2.leasingvertrag
	(pk_leasingvertragId			int not null auto_increment
    ,datum							date not null		
    ,leasingRate                    double
    ,dauer                          int not null		
    ,fk_personId                    int not null
    ,fk_unternehmenId               int not null
    ,fk_fahrzeugId					int not null
	,primary key (pk_leasingvertragId)
    ,foreign key (fk_personId) 		references person(pk_personId)
    ,foreign key (fk_unternehmenId) references unternehmen(pk_unternehmenId)
    ,foreign key (fk_fahrzeugId)	references fahrzeug(pk_fahrzeugId)
	)	
;