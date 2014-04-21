function Manager(opts) {
	// The count, including this one
	this.count = 2;
}

// STUB

Manager.prototype.broadcast = function(data) {

	var self = this;

	if (data.uri != "fakeaddress")
	{

		var response = {
			id: 1,
			value: {
				type: "isNotMaster",
				uri: data.uri
			}
		}

		self.onMessage(response);

		window.setTimeout(function() {

			var call = {
				id: 1,
				value: {
					uri: data.uri,
					type: "call",
					fn: "send",
					args: "more"
				}
			};

			self.onMessage(call);

		}, 3000);

	} else {

		var response = {
			id: 1,
			value: {
				type: "isMaster",
				uri: data.uri
			}
		}

		self.onMessage(response);

		window.setTimeout(function() {

			var message = {
				id: 1,
				value: {
					uri: data.uri,
					type: "event",
					args: ['message', 'externalmsg']
				}
			};

			self.onMessage(message);

		}, 2000);

	}


}