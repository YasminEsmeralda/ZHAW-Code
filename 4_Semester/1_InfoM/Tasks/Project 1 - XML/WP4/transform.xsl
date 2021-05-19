<?xml version='1.0' encoding='UTF-8'?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

  <xsl:key name="keyToMieter" match="mieter" use="garage"/>
  <xsl:key name="keyToGarage" match="garage" use="id"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Project 1: XML</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous"/>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0" crossorigin="anonymous"></script>
      </head>
      <body>
        <div class="container">
          <h1 class="display-3 text-center fw-bold">Project 1: XML</h1>
          <img src="../WP1.png"/>
          <xsl:for-each select="data/garagen/garage">
            <div class="card my-2">
              <div class="card-header">
                <h3 class="display-5 text-primary"><xsl:value-of select="name"/></h3>
              </div>
              <div class="card-body">
                <div class="container">
                  <div class="row">
                    <div class="col-md-auto">
                      <p>Kapazität</p>
                      <p>besetzt</p>
                      <p>frei</p>
                    </div>
                    <div class="col-md-auto">
                      <p><span class="badge bg-primary mx-2"><xsl:value-of select="kapazität"/></span></p>
                      <p><span class="badge bg-danger mx-2"><xsl:value-of select="count(key('keyToMieter', id))"/></span></p>
                      <p><span class="badge bg-success mx-2"><xsl:value-of select="kapazität - count(key('keyToMieter', id))"/></span></p>
                    </div>
                    <div class="col-md-4 offset-md-4">
                      <p class="fw-bold">Kontakt</p>
                      <p><xsl:value-of select="unternehmen"/></p>
                      <p><xsl:value-of select="adresse"/></p>
                      <p><xsl:value-of select="telefonNr"/></p>
                      <a class="btn btn-secondary" href="mailto:{mail}" role="button"><xsl:value-of select="mail"/></a>
                    </div>
                  </div>
                </div>
              </div>
              <ul class="list-group list-group-flush">
                <xsl:for-each select="key('keyToMieter', id)" >
                  <button type="button" class="list-group-item list-group-item-action" data-bs-toggle="modal" data-bs-target="#personModal{id}"><xsl:value-of select="name"/></button>
                </xsl:for-each>
              </ul>
            </div>
          </xsl:for-each>
        </div>

        <xsl:for-each select="data/mieterData/mieter">
          <div class="modal fade" id="personModal{id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">
                    <p>Mieter: <xsl:value-of select="name"/></p>
                  </h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="container">
                    <div class="row">
                      <div class="col-md-auto">
                        <p>Parkplatz Nr.</p>
                        <p>Kontrollschild</p>
                        <p>Fahrzeug</p>
                        <p>Modell</p>
                      </div>
                      <div class="col-md-auto">
                        <p><xsl:value-of select="ppNr"/></p>
                        <p><xsl:value-of select="kontrollschild"/></p>
                        <p><xsl:value-of select="fahrzeug"/></p>
                        <p><xsl:value-of select="modell"/></p>
                      </div></div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </xsl:for-each>
        </body>
      </html>
    </xsl:template>
  </xsl:stylesheet>
