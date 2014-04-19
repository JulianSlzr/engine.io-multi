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
	
	this.Socket = function(uri, opts) {

		this.multi = multi;
		var parent = this.multi;
		var socket = this;

		// If not called constructively
		if (!(this instanceof parent.Socket)) return new parent.Socket(uri, opts);

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
		var expected = tabs.count - 1;

		// Reach out to bros

		tabs.onMessage = function(message) {

			if (message.uri == uri && message.type == "isMaster") {

				// TODO: create socket wrapper
				// message.id has master tab's id

			} else if (message.uri == uri && message.type == "isNotMaster") {
				
				if (--expected <= 0) {

					console.log("All responses received. Becoming master for "+uri+"...")

					// TODO: become master

					// We will create the proper parent.engine(uri, opts)

					console.log(this)

					// TODO: error handling
					socket.master = parent.engine(uri, opts);

					// TODO: Generalize event propagation up
					socket.master.on('open', function() {
						socket.emit('open');
					});
				}

			}

		};

		tabs.broadcast({id: id, uri: uri});

		// TODO: TIMEOUT

		// The socket shim (i.e., this function as object) is returned (by being a constructor)
	};

	// TODO: Generalize wrapper (loop through eio.Socket and automagically create wrappers?)
	this.Socket.prototype.send = function() {
		if (this.master) {
			this.master.send(arguments)
		} else {
			// TODO: send message over inter-tab
		}

	}

	// We use engine.io-client's very nice emitter for event handling
	this.engine.Emitter(Multi.prototype);
	this.engine.Emitter(this.Socket.prototype);

}