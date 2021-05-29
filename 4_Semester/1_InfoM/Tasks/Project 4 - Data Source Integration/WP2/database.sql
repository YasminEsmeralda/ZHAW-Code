drop schema infom_project_4;
create schema infom_project_4 default character set utf16;

commit;

create table infom_project_4.company
	(pk_companyId					int not null auto_increment	
    ,name							character(100) not null 		
    ,industry						character(100) not null			
	,primary key (pk_companyId)
	)	
;

create table infom_project_4.pensionFund
	(pk_pensionFundId				int not null auto_increment	
    ,name							character(100) not null 		
    ,prize							double not null			
	,primary key (pk_pensionFundId)
	)	
;

create table infom_project_4.employee
	(pk_employeeId					int not null auto_increment	
    ,name							character(100) not null 		
    ,salary							double not null 
    ,birthdate						date not null		-- M/F
    ,hiredSince						int 
    ,fk_companyId					int not null
    ,fk_pensionFundId				int not null
	,primary key (pk_employeeId)
    ,foreign key (fk_companyId) 	references company(pk_companyId)
    ,foreign key (fk_pensionFundId) references pensionFund(pk_pensionFundId)
	)	
;

commit;