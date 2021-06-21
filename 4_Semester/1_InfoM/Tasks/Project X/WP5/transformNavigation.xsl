<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:key name="keyToNavigation" match="navigation" use="fk_menu_id"/>

  <xsl:key name="keyFromNavigationToProvisions" match="provision" use="fk_navigation_id"/>

  <xsl:key name="keyFromProvisionsToPage" match="page" use="pk_page_id"/>

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
        <link href="myStyle.css" rel="stylesheet"/>
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
                    <a class="nav-link" href="page.html">Page</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Navigation</a>
                  </li>
                </ul>
              </div> <!-- end .collapse navbar-collapse -->
            </div> <!-- end .container-fluid -->
          </nav> <!-- end .navbar navbar-expand-lg navbar-light bg-light -->

          <!-- Page Title -->
          <h5 class="display-5 mb-5 mt-5">
            Information Management Project X:
            <strong>Navigation</strong>
          </h5>

          <!-- Accordion per Navigation -->
          <div class="accordion" id="accordionExample">
            <xsl:for-each select="data/navigations/navigation">
              <xsl:if test="navigation_type = 'menu'">
                <div class="accordion-item">
                  <h2 class="accordion-header" id="headingOne">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne{pk_navigation_id}" aria-expanded="true" aria-controls="collapseOne{pk_navigation_id}">
                      <xsl:value-of select="label"/>
                    </button>
                  </h2>
                  <div id="collapseOne{pk_navigation_id}" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                    <div class="accordion-body">
                      <p>
                        Layout: "<xsl:value-of select="layout"/>"
                      </p>
                      <table class="table table-striped table-hover">
                        <thead class="table-success">
                          <tr>
                            <th scope="col">#</th>
                            <th scope="col">Navigation</th>
                            <th scope="col">Layout</th>
                            <th scope="col">Label</th> <!-- if Navigation is Menu -->
                            <th scope="col">Views</th> <!-- if Navigation is Item -->
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          <xsl:for-each select="key('keyToNavigation', pk_navigation_id)">
                            <tr>
                              <th scope="row">
                                <xsl:value-of select="position()"/>
                              </th>
                              <td><xsl:value-of select="navigation_type"/></td>
                              <td><xsl:value-of select="layout"/></td>
                              <td>
                                <xsl:choose>
                                  <xsl:when test="label != 'NULL'">
                                    <xsl:value-of select="label"/>
                                  </xsl:when>
                                  <xsl:otherwise>
                                    -
                                  </xsl:otherwise>
                                </xsl:choose>
                              </td>
                              <td>
                                <xsl:choose>
                                  <xsl:when test="number_of_views != 'NULL'">
                                    <xsl:value-of select="number_of_views"/>
                                  </xsl:when>
                                  <xsl:otherwise>
                                    -
                                  </xsl:otherwise>
                                </xsl:choose>
                              </td>
                              <td>
                                <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#detailNavigation{pk_navigation_id}">i</button>
                              </td>
                            </tr>
                          </xsl:for-each> <!-- end .key('keyToNavigation', pk_navigation_id) -->
                        </tbody>
                      </table>
                    </div> <!-- end .accordion-body -->
                  </div> <!-- end .collapseOne{pk_navigation_id} -->
                </div> <!-- end .accordion-item -->
              </xsl:if> <!-- end .navigation_type = 'menu' -->
            </xsl:for-each> <!-- end .data/navigations/navigation -->
          </div> <!-- end .accordion -->

          <!-- Modal Window per Navigation detail -->
					<xsl:for-each select="data/navigations/navigation">
						<div class="modal fade" id="detailNavigation{pk_navigation_id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
							<div class="modal-dialog modal-lg">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title" id="exampleModalLabel">
											Navigation Details for Navigation:
											"<xsl:value-of select="layout"/>"
										</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div> <!-- end .modal-header -->
									<div class="modal-body">
										<table class="table table-striped table-hover">
											<thead class="table-success">
												<tr>
													<th scope="col">#</th>
													<th scope="col">Provision Period</th>
													<th scope="col">Page</th>
													<th scope="col">Language</th>
												</tr>
											</thead>
											<tbody>
												<xsl:for-each select="key('keyFromNavigationToProvisions', pk_navigation_id)">
													<tr>
														<th scope="row">
															<xsl:value-of select="position()"/>
														</th>
														<td>
															<xsl:value-of select="date_from"/>
															to
															<xsl:value-of select="date_to"/>
														</td>
														<td><xsl:value-of select="key('keyFromProvisionsToPage', fk_page_id)/name"/></td>
														<td><xsl:value-of select="key('keyFromProvisionsToPage', fk_page_id)/language"/></td>
													</tr>
												</xsl:for-each> <!-- end .key('keyFromNavigationToProvisions', pk_navigation_id) -->
											</tbody>
										</table>
									</div> <!-- end .modal-body -->
								</div> <!-- end .modal-content -->
							</div> <!-- end .modal-dialog modal-lg -->
						</div> <!-- end .modal fade -->
					</xsl:for-each> <!-- end .data/navigations/navigation -->

          <!-- Back to Top button -->
          <button type="button" class="btn btn-danger btn-floating btn-lg" id="btn-back-to-top">
            UP
          </button>
        </div> <!-- end .contaienr -->
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
