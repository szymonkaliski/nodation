module.exports = function(options) {
	var app = options.app;
	var graphs = options.mongodb.collection("graphs");
	var ObjectId = options.ObjectId;

	app.post("/api/save", function(req, res) {
		graphs.save(req.body, function(error, inserted) {
			if (!error) res.send(inserted._id, 200);
			else res.send(500);
		});
	});

	app.get("/api/load/:id", function(req, res) {
		graphs.findOne({ _id: ObjectId(req.params.id) }, function(error, graph) {
			if (!error) res.send(graph);
			else res.send(500);
		});
	});
};
