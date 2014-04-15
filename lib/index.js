// TODO: Replace with actual inter-tab module
var it = require("./inter-tab");

exports.attach = function(engine, opts) {
	if (engine.constructor.name == "Server") {
		// TODO

	} else if (engine.constructor.name == "Socket") {
		var socket = engine;

		// Find which tabs are connected to the same uri, and which is master
		for (tab in it.tabs()) {
			connections = it.get(tab.id, "connections");
			for (c in connections) {
				if (c.isMaster && c.hostname == socket.hostname && c.port == socket.port && c.query == socket.query) {

					// HIDDEN CLOSE

					// Master exists, delegate everything to that
					socket.send = function (msg, fn) {
						it.on("sendMessageDone", fn);
						it.send(tab.id, "sendMessage", {id: c.id, msg: msg});
					}

					return;
				}
			}
		}

		// ELSE: Become the master

		// Create handler
		it.on("sendMessage", function (origin, data) {
			// TODO: Add metadata for server demulti
			socket.send(data.msg, function(args) {
				// Function is done, trigger callback on original tab
				it.send(origin.id, "sendMessageDone");
			});
		});

	}
}

exports = module.exports = function() {
  return exports.attach.apply(this, arguments);
};


// Return a regular socket if not connected
// Return the 'augmented' socket if connected

function multisend(uri, opts) {

	



}

/
