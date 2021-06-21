<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:key name="keyToPage" match="page" use="pk_page_id"/>

	<xsl:key name="keyToNavigation" match="navigation" use="pk_navigation_id"/>

	<xsl:key name="keyFromProvisionsToNavigation" match="navigation" use="pk_navigation_id"/>

	<xsl:key name="keyFromPageToProvisions" match="provision" use="fk_page_id"/>

	<xsl:template match="/">
		<html>
			<head>
				<title>
					Project X Backend
				</title>
				<!-- bootstrap -->
				<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous"/>
				<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0" crossorigin="anonymous"></script>
				<!-- own scripts -->
		    <script type="text/javascript" src="myScript.js"></script>
		    <!-- own links -->
		    <link href="myStyle.css"  rel="stylesheet"/>
			</head>
			<body>
				<div class="container">
					<!-- Navigation Bar -->
					<nav class="navbar navbar-expand-lg navbar-light bg-light">
						<div class="container-fluid">
							<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
								<span class="navbar-toggler-icon"></span>
							</button>
							<div class="collapse navbar-collapse" id="navbarNav">
								<ul class="navbar-nav">
									<li class="nav-item">
										<a class="nav-link" href="index.html">Home</a>
									</li>
									<li class="nav-item">
										<a class="nav-link" href="#">Page</a>
									</li>
									<li class="nav-item">
										<a class="nav-link" href="navigation.html">Navigation</a>
									</li>
								</ul>
							</div> <!-- end .collapse navbar-collapse -->
						</div> <!-- end .container-fluid -->
					</nav> <!-- end .navbar navbar-expand-lg navbar-light bg-light -->

					<!-- Page Title -->
					<h5 class="display-5 mb-5 mt-5">
						Information Management Project X:
						<strong>Page</strong>
					</h5>

					<!-- Card per Page -->
					<div class="row">
						<xsl:for-each select="data/pages/page">
							<div class="col-sm-3 mb-4">
								<div class="card">
									<div class="card-body">
										<h5 class="card-title"><xsl:value-of select="name"/></h5>
										<p class="card-text">Language:
											<xsl:value-of select="language"/>
										</p>
										<button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#detailModal{pk_page_id}">details</button>
									</div> <!-- end .card-body -->
								</div> <!-- end .card -->
							</div> <!-- end .col-sm-3 mb-4 -->
						</xsl:for-each> <!-- end .data/pages/page -->
					</div> <!-- end .row -->

					<!-- Modal Window per Page -->
					<xsl:for-each select="data/pages/page">
						<div class="modal fade" id="detailModal{pk_page_id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
							<div class="modal-dialog modal-lg">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title" id="exampleModalLabel">
											Page:
											"<xsl:value-of select="name"/>"
										</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div> <!-- end .modal-header -->
									<div class="modal-body">
										<table class="table table-striped table-hover">
											<thead class="table-success">
												<tr>
													<th scope="col">#</th>
													<th scope="col">Provision Period</th>
													<th scope="col">Navigation</th>
													<th scope="col">Layout</th>
													<th scope="col">Label</th> <!-- if Navigation is Menu -->
													<th scope="col">Views</th> <!-- if Navigation is Item -->
												</tr>
											</thead>
											<tbody>
												<xsl:for-each select="key('keyFromPageToProvisions', pk_page_id)">
													<tr>
														<th scope="row">
															<xsl:value-of select="position()"/>
														</th>
														<td>
															<xsl:value-of select="date_from"/>
															to
															<xsl:value-of select="date_to"/>
														</td>
														<td><xsl:value-of select="key('keyFromProvisionsToNavigation', fk_navigation_id)/navigation_type"/></td>
														<td><xsl:value-of select="key('keyFromProvisionsToNavigation', fk_navigation_id)/layout"/></td>
														<td>
															<xsl:choose>
																<xsl:when test="key('keyFromProvisionsToNavigation', fk_navigation_id)/label != 'NULL'">
																  <xsl:value-of select="key('keyFromProvisionsToNavigation', fk_navigation_id)/label"/>
																</xsl:when>
																<xsl:otherwise>
																  -
																</xsl:otherwise>
															</xsl:choose>
														</td>
														<td>
															<xsl:choose>
																<xsl:when test="key('keyFromProvisionsToNavigation', fk_navigation_id)/number_of_views != 'NULL'">
																  <xsl:value-of select="key('keyFromProvisionsToNavigation', fk_navigation_id)/number_of_views"/>
																</xsl:when>
																<xsl:otherwise>
																  -
																</xsl:otherwise>
															</xsl:choose>
														</td>
													</tr>
												</xsl:for-each>
											</tbody>
										</table>
									</div> <!-- end .modal-body -->
								</div> <!-- end .modal-content -->
							</div> <!-- end .modal-dialog modal-lg -->
						</div> <!-- end .modal fade -->
					</xsl:for-each> <!-- end .data/pages/page -->

					<!-- Back to Top button -->
					<button type="button" class="btn btn-danger btn-floating btn-lg" id="btn-back-to-top">
					  UP
					</button>
				</div> <!-- end .contaienr -->
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
