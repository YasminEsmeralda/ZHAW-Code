<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/">
    <html>
      <head><!--  Required meta tags  -->
        <title>SW02: MC</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous" />
      </head>
      <body>
        <div class="container">
          <h1 class="display-3">SW02: MC Questions</h1>
          <xsl:for-each select="root/results/element">
            <div class="card my-2">
              <div class="card-header">
                <xsl:value-of select="category" />
                <span class="badge bg-secondary mx-2"><xsl:value-of select="difficulty" /></span>
              </div>
              <div class="card-body">
                <h5 class="card-title">  <xsl:value-of select="question" /></h5>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><xsl:value-of select="correct_answer" /></li>
                <xsl:for-each select="incorrect_answers/element">
                  <li class="list-group-item"><xsl:value-of select="." /></li>
                </xsl:for-each>
              </ul>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
