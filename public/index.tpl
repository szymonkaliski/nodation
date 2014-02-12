<!doctype html5>
<head>
	<title>nodation</title>
</head>
<body>
	<!-- @if BUILD_ENV == 'DEVELOPMENT' -->
	<script data-main="scripts/app" src="scripts/libraries/require.js"></script>
	<!-- @endif -->

	<!-- @if BUILD_ENV == 'PRODUCTION' -->
	<script src="scripts/nodation.min.js"></script>
	<!-- @endif -->
</body>
