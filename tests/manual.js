#!/usr/bin/env node

var CommandTask = require('../');

// var basic = new CommandTask('ls -a', '..');
// basic.start();
// basic.start('list-all');
// basic.start(getmycb(basic));
// basic.start('list-all-with-cb', getmycb(basic));

var withmsgs = new CommandTask('ls -l', '..', '.');
withmsgs.start();
withmsgs.start('named-for-log');

function getmycb(cmdtask) {
	var mycmd = cmdtask;
	return function () {
		console.log('done', mycmd.command);
	};
}
