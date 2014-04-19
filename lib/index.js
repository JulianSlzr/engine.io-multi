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

	var self = this;
	var multi = this;

	if (engine.name == "Server") {
	// TODO

	} else if (engine.name == "Socket") {
		// We were passed a engine.io-client function

		// Store state
		self.engine = engine;
		self.client = true;

		// Augment inter-tab with events
		self.engine.Emitter(Manager.prototype);

		// New inter-tab instance
		self.tabs = new Manager();

		// Event normalization and delegation
		self.tabs.onMessage = function(data) {
			this.emit('message', data.id, data.value);
		};
		// We treat broadcasts identically as messages
		self.tabs.onBroadcast = function(data) {
			// TODO: fix special value
			tabId = data.value.tabId || -1;
			delete data.value.tabId;
			this.emit('message', tabId, data.value);
		};
	}

	this.Socket = function(uri, opts) {

		var parent = multi;
		var socket = this;
		var self = this;

		// If user invokes this like eio, i.e., with no new keyword
		if (!(self instanceof parent.Socket)) return new parent.Socket(uri, opts);

		socket.multi = parent;
		socket.isMaster = false;
		socket.uri = "";

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

		// TODO: multiple event handlers for tabs.onmessage; give inter-tab an emitter class

		tabs.on('message', function(sender, data) {

			if (data.uri == uri && data.type == "isMaster") {

				// TODO: create socket wrapper which exposes the same interface as the original socket

				socket.master = new parent.Delegator(sender)

				// data.id has master tab's id

			} else if (data.uri == uri && data.type == "isNotMaster") {
				
				if (--expected <= 0) {

					console.log("All responses received. Becoming master for "+uri+"...")

					// TODO: error handling
					socket.isMaster = true;
					socket.master = parent.engine(uri, opts);
					// TODO: use engine.io-client's stored value?
					socket.uri = uri;

					tabs.on('message', function(data) {
						sender = data.id
						data = data.value;
						switch (data.type) {
						case "call":
							// TODO: Arbitrary function naming bad? Also, how do we protect against malicious tabs?
							// TODO: How do we deal with callbacks being fucked?
							result = self.master[data.fn](data.args);
							// TODO: Send result back
						}
					});
				}

			}

		});

		// When bros call

		// TODO: Use normalized URIs throughout

		tabs.on('message', function(data) {

			if (data.type == "isMaster?") {

				if (socket.isMaster && data.uri == socket.uri) {

					tabs.send(data.tabId, {type: "isMaster", uri: data.uri});

				} else {

					tabs.send(data.tabId, {type: "isNotMaster", uri: data.uri});

				}
			
			}

		});

		tabs.broadcast({tabId: id, type: "isMaster?", uri: uri});

		// Propagate events in general
		// TODO: THIS WON'T WORK ASYNC RIGHT NOW
		// TODO: ASSUMES MASTER EXISTS
		oldOn = socket.on;
		socket.on = function(event, fn) {
			oldOn.apply(this, arguments);
			socket.master.on(event, function() {
				socket.emit(event, arguments);
			});
		};

		// TODO: TIMEOUT

		// The socket shim (i.e., this function as object) is returned (by being a constructor)
	};

	// TODO: Generalize wrapper (loop through eio.Socket and automagically create wrappers?)
	this.Socket.prototype.send = function() {
		this.master.send(arguments)
	};

	// This sends and receives function calls, events, etc. from a specific tab
	// Explicitly a socket for now

	this.Delegator = function(sender) {

		var self = this;
		self.tab = sender;

		// this needs to be chainable
		tabs.on('message', function(data) {
			if (data.id == self.tab) {
				data = data.value;
				switch (data.type) {
				case "event":
					self.emit(data.args);
				}
			}
		});

	};

	// TODO: Generalize wrapper
	this.Delegator.prototype.send = function() {
		tabs.send(this.tab, {
			type: "call",
			fn: "send",
			args: arguments
		});
	};

	// We use engine.io-client's very nice emitter for event handling
	this.engine.Emitter(Multi.prototype);
	this.engine.Emitter(this.Socket.prototype);
	this.engine.Emitter(this.Delegator.prototype);
}