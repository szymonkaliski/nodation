var fs = require("fs");
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require('body-parser');
var logger = require('morgan');

var mongodb = mongojs(process.env.MONGOLAB_URI || "nodation");
var ObjectId = mongojs.ObjectId;

// configure app
var app = express();

app.use("/", express.static(__dirname + "/public"));
app.use(bodyParser());
app.use(logger('combined'));

// load modules as needed
if (fs.existsSync("./modules")) {
	// setup app modules
	var modulesOptions = {
		"app": app,
		"mongodb": mongodb,
		"ObjectId": ObjectId
	};

	// load app modules
	fs.readdirSync("./modules").forEach(function(module) {
		require("./modules/" + module)(modulesOptions);
	});
}

// run server
app.listen(process.env.PORT || 3000);
