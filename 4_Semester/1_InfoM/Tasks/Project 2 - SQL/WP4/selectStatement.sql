Select l.pk_leasingvertragId as VertragsNr
      ,l.datum as Vertragsdatum
      ,l.dauer as Vertragsdauer
      ,l.leasingRate as 'monatliche Rate'
      ,concat(p.vorname, ' ', p.nachname) as Vertragsnehmer
	  ,concat(p.adresse, ' ', p.hausnummer, ', ', p.postleitzahl) as Adresse 
      ,p.geburtstag as Geburtstag
      ,p.telNummer as Kontakt
      ,concat(f.marke, ': ', f.modell) as Fahrzeug
      ,concat(f.km_Stand, ' km') as Kilometerstand
 from infom_project_2.person as p
 join infom_project_2.leasingVertrag as l
   on l.fk_personId = p.pk_personId
 join infom_project_2.unternehmen as u
   on l.fk_unternehmenId = u.pk_unternehmenId
   join infom_project_2.fahrzeug as f
   on l.fk_fahrzeugId = f.pk_fahrzeugId
-- where l.datum = '2002-09-09'
-- where l.datum between '2005-01-01' and '2010-12-31'
 where p.geburtstag between '1970-01-01' and '2003-12-31'
order by l.pk_leasingvertragId
;
