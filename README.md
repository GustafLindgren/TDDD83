### Kandidatarbete TDDD83 Grupp 6
_Detta dokument utgör instruktioner hur Git ska användas under arbetet._
##### Grundläggande om Git
- ```<feature> -feature  branch```, där man jobbar isolierat från master. 
ex,  ```log-in-feature```
- ```Master branch```, den branch som är tänkt att publiceras mot användare.
- ```dev-master```, branch för att testa kod innan den mergas till master, en "låtsas-master-branch"


En feature är en distinkt attribut eller funktionalitet som en applikation har. När du ska börja på en ny feature, t.ex som funktionalitet för att logga in eller för att få sammanfattning av kassan. Så **ska du skapa en ny branch** innan du börjar. Utgå ifrån ```dev-master``` för att vara säker på att all kod vi skrivit följer med.
```git checkout -b log-in-feature``` Detta kommando komer skapa en ny branch som heter log-in-feature och kommer automatiskt förflytta dig till den branchen. Så när du sedan commitar, commitar du **endast** till denna branch. 
```git push``` och ```git pull``` behöver specificeras till vilken branch du syftar du. 
Ex ```git push origin log-in-feature```. obs detta gäller inte alltid, för vissa verkar ```git push``` räcka. 


###### _Grundläggande principer_
- Gör alltid en ```git pull``` innan du börjar arbeta! Detta synkar ditt lokala repo med projektets repo
- Titta igenom de delar som hämtats och kolla om det berör du ska arbeta med 
- Börja arbeta 
- Gör en ```git pull```innan du pushar, kolla så inget berör du skrivit. Om du VET att arbetar själv i en fil är detta inte lika viktigt. 
- Gör en ```git add```använd inte ```git add.``` Om vår git.ignore inte är perfekt kommer vi råka versionshantera alla möjliga slags filer.
>**TIPS:** Om du har flera filer som heter client.html, client.js och client.css kan du adda alla dessa genom att skriva ```git add client.*``` 
- Gör en ```git commit -m "meddelande"```. OBS hur meddelandet ska skrivas kommer senare.
- Fortsätt arbeta eller om du arbetat färdigt gör en ```git push```. 
>**TIPS:** Du kan verkligen inte commita för ofta. Tumregel är att commita efter nya metoder eller större tilläg. 

## Commit
##### _Hur en commit ska göras:_
Använd tags för att beskriva vilken typ av commits du gör. Tumregel är att taggen ska motsvara- Min commit är en....

| Tag | Beskrivning | 
|-----------|-------------|
|***feat***  |Om något lagts till t.ex en metod eller en liten feature| 
|***fix***  |Om du löst en bug eller liknande problem|
|***refactor***|Refactorering, t.ex bytt namn på variabler|
|***style***|Förändring i indentering, avsaknande semikolon etc. Inga förändringar i kod| 
|***WIP***|Work in progress, en slags mellancommit, för att undvika jättestora patches|
|***hack***|Ful-lösning, använd helst inte, temporär lösning för att saker ska flyta|
Verb skrivs i infinitform, t.ex "Add", "Fix" och inleds med versal. Så **inte** "Added", "Fixed", "Did".
#####  _Exempel på en commit_ 
```git commit -m "[feat] Add login-button"```
```git commit -m "[fix] Solve bug where non-admin could add own donor-organisations"```
```git commit -m "[refactor][WIP] Change variable names in index.html, not finished"```

## Merge request: 
Gör bara en merge request när den branch du jobbar med är färdig. Sedan får en annan kolla så att den funkar som den ska och en merge request kan göras. 
Skapa en mergerequest manuellt på gitlabs hemsida. Välj branchen du jobbat med och merga in den i dev-master. Sen bestämmer vi tillsammas när vi kan merga in till master. Det sker en gång i veckan, i huvudsak fredag kl 13 och innan användartester.





