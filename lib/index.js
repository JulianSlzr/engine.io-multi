
exports.attach = function(engine, opts) {
	if (engine.constructor.name == "Server") {
		// TODO
	} else if (engine.constructor.name == "Socket") {
		// TODO
	}
}

exports = module.exports = function() {
  return exports.attach.apply(this, arguments);
};