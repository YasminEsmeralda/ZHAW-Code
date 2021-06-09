<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">

		<html>
			<head>
				<title>
					Project X Backend
				</title>
				<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous"/>
				<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0" crossorigin="anonymous"></script>
			</head>
			<body>
        <h1>Page</h1>
				<xsl:for-each select="data/pages/page">
					<div><xsl:value-of select="pk_page_id"/></div>
				</xsl:for-each>

        <h1>Menu</h1>
        <xsl:for-each select="data/navigations/menus/menu">
					<div><xsl:value-of select="pk_navigation_id"/></div>
				</xsl:for-each>

        <h1>Item</h1>
        <xsl:for-each select="data/navigations/items/item">
					<div><xsl:value-of select="pk_navigation_id"/></div>
				</xsl:for-each>

        <h1>Provision</h1>
        <xsl:for-each select="data/provisions/provision">
					<div><xsl:value-of select="pk_provision_id"/></div>
				</xsl:for-each>

			</body>
		</html>

	</xsl:template>
</xsl:stylesheet>
