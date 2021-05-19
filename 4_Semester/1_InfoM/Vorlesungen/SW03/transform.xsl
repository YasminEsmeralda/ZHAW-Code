<?xml version='1.0' encoding='UTF-8'?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

	<xsl:key name="keyToPerson" match="person" use="id"/>

	<xsl:key name="keyFromPersonToProjects" match="project" use="lead"/>

	<xsl:key name="keyFromProjectToParticipations" match="participation" use="project"/>

	<xsl:template match="/">
		<html>
			<head>
				<title>SW03: Projects</title>
				<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous"/>
				<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0" crossorigin="anonymous"></script>
			</head>
			<body>
				<div class="container">
					<h1 class="display-3">SW03: Projects View</h1>

					<xsl:for-each select="data/projects/project">
						<div class="card my-2">
							<div class="card-header">

								<xsl:value-of select="title"/>

								<xsl:if test="turnover &lt; 200000">
									<span class="badge bg-secondary mx-2"><xsl:value-of select="turnover"/></span>
								</xsl:if>

								<xsl:if test="turnover &gt; 199999.99">
									<span class="badge bg-warning mx-2"><xsl:value-of select="turnover"/></span>
								</xsl:if>
							</div>
							<div class="card-body">

								<p><xsl:value-of select="description"/></p>
								<a class="btn btn-secondary" href="mailto:{key('keyToPerson', lead)/eMail}" role="button"><xsl:value-of select="key('keyToPerson', lead)/name"/></a>
								<button type="button" class="btn btn-primary mx-2" data-bs-toggle="modal" data-bs-target="#personModal{lead}">
									<xsl:value-of select="key('keyToPerson', lead)/name"/>
								</button>

							</div>

							<ul class="list-group list-group-flush">

								<xsl:for-each select="key('keyFromProjectToParticipations', id)">
									<button type="button" class="list-group-item list-group-item-action" data-bs-toggle="modal" data-bs-target="#personModal{person}"><xsl:value-of select="key('keyToPerson', person)/name"/></button>
									<!--<li class="list-group-item"><xsl:value-of select="key('keyToPerson', person)/name" /></li>-->
								</xsl:for-each>
							</ul>

						</div>
					</xsl:for-each>
				</div>

				<xsl:for-each select="data/persons/person">
					<div class="modal fade" id="personModal{id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
						<div class="modal-dialog">
							<div class="modal-content">
								<div class="modal-header">
									<h5 class="modal-title" id="exampleModalLabel">

										<xsl:value-of select="name"/>
										<span class="badge bg-secondary mx-2"><xsl:value-of select="sum(key('keyFromPersonToProjects', id)/turnover)"/></span>
									</h5>
									<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
								</div>
								<div class="modal-body">
									<p><xsl:value-of select="bio"/></p>
									<ul class="list-group">

										<xsl:for-each select="key('keyFromPersonToProjects', id)">
											<li class="list-group-item d-flex justify-content-between align-items-center">

												<xsl:value-of select="title"/>
												<span class="badge rounded-pill bg-secondary mx-2"><xsl:value-of select="turnover"/></span>
											</li>
										</xsl:for-each>
									</ul>
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
