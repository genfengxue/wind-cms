var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Behavior Model
 * =============
 */

var Behavior = new keystone.List('Behavior', {
	nocreate: true,
	noedit: true
});

Behavior.add({
	ip: { type: String },
	ua: { type: String },
	browser: { name: String, version: String, major: String },
	engine: {name: String, version: String, },
	os: {name: String, version: String, },
	device: {type: String },
	session: { type: String },
	scope: { type: String },
	action: { type: String },
	value: { type: String },
	created: {type: Date},
});

Behavior.defaultSort = '-created';
Behavior.defaultColumns = 'ip, scope, action, browser.name, engine.name, os.name, created';
Behavior.register();
