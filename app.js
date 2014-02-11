var fs = require("fs");
var express = require("express");
var mongojs = require("mongojs");

var mongodb = mongojs(process.env.MONGOLAB_URI || "nodation");

// configure app
var app = express();
app.configure(function() {
	app.use("/", express.static(__dirname + "/public"));
	app.use(express.bodyParser());
	app.use(express.logger());
});

// load modules as needed
if (fs.existsSync("./modules")) {
	// setup app modules
	var modulesOptions = { "app": app, "mongodb": mongodb };

	// load app modules
	fs.readdirSync("./modules").forEach(function(module) {
		require("./modules/" + module)(modulesOptions);
	});
}

// run server
app.listen(process.env.PORT || 3000);
