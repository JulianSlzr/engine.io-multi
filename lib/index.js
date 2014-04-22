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
		self.tabId = self.tabs.id;

		// Event normalization and delegation
		self.tabs.onMessage = function(data) {
			// TODO: fix special value
			tabId = data.value.tabId || -1;
			delete data.value.tabId;
			this.emit('message', tabId, data.value);
		};
		// We treat broadcasts identically as messages
		self.tabs.onBroadcast = function(data) {
			// TODO: fix special value
			tabId = data.value.tabId || -1;
			delete data.value.tabId;
			// TODO: Why does inter-tab broadcast to itself?
			if (tabId != self.tabId) {
				this.emit('message', tabId, data.value);
			}
		};
		self.tabs.onDestroy = function(data) {
			this.broadcast({tabId: self.tabId, type: "close"});
		}
	}

	this.Socket = function(uri, opts) {

		var parent = multi;
		var socket = this;
		var self = this;

		// If user invokes this like eio, i.e., with no new keyword
		if (!(self instanceof parent.Socket)) return new parent.Socket(uri, opts);

		socket.parent = parent;
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

		console.log("I am tab "+parent.tabId);

		// TODO: counter for expected responses
		var expected = Object.keys(tabs.getTabs()).length - 1;

		// functions to call once master is assigned
		self.toCall = [];

		// Reach out to bros

		tabs.on('message', function(sender, data) {

			if (data.uri == uri && data.type == "isMaster") {

				console.log(sender+" is the master, delegating...")

				// TODO: create socket wrapper which exposes the same interface as the original socket

				socket.master = new parent.Delegator(sender, uri, self);
				self.callAll()
				self.master.emit('open');

				// data.id has master tab's id

			} else if (data.uri == uri && data.type == "isNotMaster") {
				
				console.log(sender+" is not the master")

				if (--expected <= 0) {

					self.becomeMaster(uri);
				}

			}

		});

		// When bros call

		// TODO: Use normalized URIs throughout

		tabs.on('message', function(sender, data) {

			if (data.type == "isMaster?") {

				if (socket.isMaster && data.uri == socket.uri) {

					tabs.send(sender, {tabId: parent.tabId, type: "isMaster", uri: data.uri});

				} else {

					tabs.send(sender, {tabId: parent.tabId, type: "isNotMaster", uri: data.uri});

				}
			
			}

		});

		if (expected > 0) {
			console.log("Expecting "+expected+" responses...")
			tabs.broadcast({tabId: parent.tabId, type: "isMaster?", uri: uri});
		} else {
			self.becomeMaster(uri);
		}

		// Propagate events in general
		oldOn = socket.on;
		socket.on = function(event, fn) {
			oldOn.apply(this, arguments);

			addHandler = function() {
				self.master.on(event, function() {
					self.emit(event, arguments);
				});
			}

			self.master ? addHandler() : self.toCall.push(addHandler);
		};

		// TODO: TIMEOUT

		// The socket shim (i.e., this function as object) is returned (by being a constructor)
	};

	// TODO: Generalize wrapper (loop through eio.Socket and automagically create wrappers?)
	this.Socket.prototype.send = function() {
		this.master.send(arguments)
	};

	this.Socket.prototype.becomeMaster = function(uri) {

		var self = this;

		console.log("All responses received. Becoming master for "+uri+"...")

		// TODO: error handling
		self.isMaster = true;
		self.master = self.parent.engine(uri, opts);
		self.callAll();
		// TODO: use engine.io-client's stored value?
		self.uri = uri;

		self.parent.tabs.on('message', function(sender, data) {
			if (self.uri == data.uri) {
				switch (data.type) {
				case "call":
					// TODO: Arbitrary function naming bad? Also, how do we protect against malicious tabs?
					// TODO: How do we deal with callbacks being fucked?
					result = self.master[data.fn](data.args);
					// TODO: Send result back
				}
			}
		});

		// TODO: wait till open?
		self.emit('master');
	};

	this.Socket.prototype.callAll = function() {
		for (var i = 0; i < this.toCall.length; i++) {
			this.toCall[i]();	
		}
		this.toCall = [];
	};

	// This sends and receives function calls, events, etc. from a specific tab
	// Explicitly a socket for now

	this.Delegator = function(sender, uri) {

		var parent = multi;
		var self = this;
		self.tab = sender;
		self.uri = uri;
		self.socket = socket;

		var tabs = parent.tabs;

		tabs.on('message', function(sender, data) {
			console.log(sender, data)
			if (sender == self.tab) {
				switch (data.type) {
				case "event":
					if (data.uri == self.uri) {
						self.emit.apply(self, data.args);
					}
					break;
				case "close":
					// TODO: NOT SUSTAINABLE
					// TODO: WHAT IF CLOSE IS REFRESH?
					var tabList = this.getTabs();
					var newMaster = Object.keys(tabList).sort()[0];
					if (parent.tabId != newMaster) {
						console.log(self.tab+" is dead, long live "+newMaster);
						self.tab = newMaster;
					} else {
						// TODO: ORDERING PROBLEMS? INTRODUCE LOCK?
						// TODO: destroy delegator object?
						self.socket.becomeMaster(self.uri);
					}
					break;
				}
			}
		});

	};

	// TODO: Generalize wrapper
	// Identify which socket
	this.Delegator.prototype.send = function() {
		parent.tabs.send(this.tab, {
			uri: uri,
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