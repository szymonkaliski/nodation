<!DOCTYPE HTML>
<head>
	<title>nodation</title>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />

	<link href="http://fonts.googleapis.com/css?family=Droid+Sans:400,700" rel="stylesheet" type="text/css">

	<style>
		* {
			margin: 0;
			padding: 0;
			font-family: "Droid Sans";
		}

		.bar {
			position: fixed;
			width: 100%;

			background: rgb(64, 59, 51);
			color: rgb(237, 235, 230);
			font-weight: 400;

			padding-top: 8px;
			padding-bottom: 8px;
			padding-left: 12px;
			padding-right: 12px;

			font-size: 12px;

			text-align: center;
		}

		.bar a {
			text-decoration: none;
			color: rgb(237, 235, 230);
			padding-bottom: 2px;
			border-bottom: 1px solid rgb(237, 235, 230);

			transition: 250ms;
		}

		.bar a:hover {
			color: rgb(187, 180, 161);
			border-bottom: 1px solid rgb(187, 180, 161);
		}

		.bar .save {
			position: fixed;
			top: 0;
			right: 0;
			cursor: pointer;
			background: rgb(26, 24, 21);

			padding-bottom: 8px;
			padding-left: 12px;
			padding-right: 12px;
			padding-top: 8px;

			transition: 250ms;
		}

		.bar .save:hover {
			background: rgb(45, 42, 36);
			color: rgb(187, 180, 161);
		}
	</style>
</head>
<body>
	<div class="bar">
		<span class="info">Experiment by <a href="http://treesmovethemost.com">Szymon Kaliski</a> made at <a href="http://fabrica.it">Fabrica</a> &copy; 2014</span>
		<span class="save">SAVE</span>
	</div>

	<!-- @if BUILD_ENV == 'DEVELOPMENT' -->
	<script data-main="scripts/app" src="scripts/libraries/require.js"></script>
	<!-- @endif -->

	<!-- @if BUILD_ENV == 'PRODUCTION' -->
	<script src="scripts/nodation.min.js"></script>
	<!-- @endif -->
</body>
