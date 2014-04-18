// TODO: Replace with actual inter-tab module
// var it = require("./inter-tab");

// Included in other file
// var it = new Manager();

// var multi = function() {
//   return Multi.apply(this, arguments);
// };

// Wrapper, so that
// TODO: eventually, multi(require('engine.io-client')) gives an eio analogue
function multi(engine, opts) {
	var inst = new Multi(engine, opts);
	return inst.Socket;
}

function Multi(engine, opts) {

	if (engine.name == "Server") {
	// TODO

	} else if (engine.name == "Socket") {
		// We were passed a engine.io-client function

		// Store state
		this.engine = engine;
		this.client = true;

	}

	// "child" constructor
	var multi = this;
	
	this.Socket = function Socket(uri, opts) {

		this.multi = multi;
		var parent = this.multi;

		// If not called constructively
		if (!(this instanceof Socket)) return new parent.Socket(uri, opts);

		// JK, use actual engine.io-client
		return parent.engine(uri, opts)
	}

	// TODO

	// Find which tabs are connected to the same uri, and which is master
	// for (tab in it.tabs()) {
	// 	connections = it.get(tab.id, "connections");
	// 	for (c in connections) {
	// 		if (c.isMaster && c.hostname == socket.hostname && c.port == socket.port && c.query == socket.query) {

	// 			// HIDDEN CLOSE

	// 			// Master exists, delegate everything to that
	// 			socket.send = function (msg, fn) {
	// 				it.on("sendMessageDone", fn);
	// 				it.send(tab.id, "sendMessage", {id: c.id, msg: msg});
	// 			}

	// 			return;
	// 		}
	// 	}
	// }

	// // ELSE: Become the master

	// // Create handler
	// it.on("sendMessage", function (origin, data) {
	// 	// TODO: Add metadata for server demulti
	// 	socket.send(data.msg, function(args) {
	// 		// Function is done, trigger callback on original tab
	// 		it.send(origin.id, "sendMessageDone");
	// 	});
	// });

}

// // Return a regular socket if not connected
// // Return the 'augmented' socket if connected

// function multisend(uri, opts) {

	



// }