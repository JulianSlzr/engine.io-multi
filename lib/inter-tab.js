function Manager(opts) {
	// The count, including this one
	this.count = 2;
}

// STUB

Manager.prototype.broadcast = function(data) {

	var response = {
		id: 1,
		value: {
			type: "isNotMaster",
			uri: data.uri
		}
	}

	this.onMessage(response);
}