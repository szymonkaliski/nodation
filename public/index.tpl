<!DOCTYPE HTML>
<head>
	<title>nodation</title>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta name="description" content="Experimental webapp for creating music using graphs.">

	<meta property="og:url" content="http://nodation.herokuapp.com" />
	<meta property="og:title" content="nodation" />
	<meta property="og:image" content="http://nodation.herokuapp.com/images/facebook.png" />
	<meta property="og:description" content="Experimental webapp for creating music using graphs." />

	<link href="http://fonts.googleapis.com/css?family=Droid+Sans:400" rel="stylesheet" type="text/css">

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

		.bar .button {
			position: fixed;
			top: 0;
			cursor: pointer;
			background: rgb(26, 24, 21);

			padding-bottom: 8px;
			padding-left: 12px;
			padding-right: 12px;
			padding-top: 8px;

			transition: 250ms;
		}

		.bar .button:hover {
			background: rgb(45, 42, 36);
			color: rgb(187, 180, 161);
		}

		.bar .button.save {
			right: 0;
		}

		.bar .button.info {
			left: 0;
		}

		.overlay {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;

			background: rgba(0, 0, 0, 0.4);
			cursor: pointer;
		}

		.overlay .text {
			position: fixed;
			width: 600px;
			height: 150px;
			padding: 20px;

			left: 50%;
			top: 50%;

			margin-left: -300px;
			margin-top: -75px;

			background: rgb(64, 59, 51);
			color: rgb(237, 235, 230);
			font-weight: 400;
			font-size: 14px;
		}

		.overlay .header {
			font-size: 18px;
		}

		.overlay ul {
			padding-top: 25px;
			padding-left: 30px;
			padding-bottom: 15px;
		}

		.overlay ul li {
			padding-bottom: 4px;
		}

		.overlay .experiment {
			font-size: 12px;
			color: rgba(237, 235, 230, 0.3);
		}
	</style>
</head>
<body>
	<div class="overlay" style="display:none">
		<div class="text">
			<span class="header">
				Nodation is experimental take on playing music using graph structures.
			</span>

			<ul>
				<li>To create playing node, click anywhere on the screen.</li>
				<li>To connect nodes, hover over one of them, and drag line to another one.</li>
				<li>To remove nodes, drag them to bottom red part of the screen.</li>
				<li>You can save your creations, and share output URL</li>
			</ul>

			<span class="experiment">
				This is just an experiment and it may not work everywhere, it was tested on latest Google Chrome and Safari.
			</span>
		</div>
	</div>

	<div class="bar">
		<span class="info">Experiment by <a href="http://treesmovethemost.com">Szymon Kaliski</a> made at <a href="http://fabrica.it">Fabrica</a> &copy; 2014</span>
		<span class="button info">INFO</span>
		<span class="button save">SAVE</span>
	</div>

	<!-- @if BUILD_ENV == 'DEVELOPMENT' -->
	<script data-main="scripts/app" src="scripts/libraries/require.js"></script>
	<!-- @endif -->

	<!-- @if BUILD_ENV == 'PRODUCTION' -->
	<script src="scripts/nodation.min.js"></script>
	<!-- @endif -->
</body>
