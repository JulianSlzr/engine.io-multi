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

		// New inter-tab instance
		this.tabs = new Manager();

	}

	// "child" constructor
	var multi = this;
	
	this.Socket = function Socket(uri, opts) {

		this.multi = multi;
		var parent = this.multi;

		// If not called constructively
		if (!(this instanceof Socket)) return new parent.Socket(uri, opts);

		/*
		
		The gist:

		We work on a URI by URI basis.

		Via the inter-tab interface, we reach out to the other tabs and ask if their multi's have connected to this URI

		If so, use that instance

		Else, we are the master of our fate, the captain of our soul; we create an instance and write handlers that will let other tabs use it

		*/

		// Revise API so that this is sent with broadcast
		var tabs = parent.tabs;
		var id = tabs.id;

		// TODO: counter for expected responses
		var expected = 1;

		// Reach out to bros

		tabs.onMessage = function(message) {

			if (message.uri == uri && message.type == "isMaster") {

				// TODO: create socket wrapper
				// message.id has master tab's id

			} else if (message.uri == uri && message.type == "isNotMaster") {
				
				if (--expected <= 0) {

					// TODO: become master

					// We will create the proper parent.engine(uri, opts)

				}

			}

		};

		tabs.broadcast({id: id, uri: uri});

		// TODO: TIMEOUT

		// The socket shim is returned (by being a constructor)
	};

}