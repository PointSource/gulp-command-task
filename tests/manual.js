#!/usr/bin/env node

var CommandTask = require('../');

var basic = new CommandTask('ls -a', '..');
var withlogs = new CommandTask('npm --loglevel http update', '..', '.');
var msgs = {
	pre: '*** going to do something',
	post: 'finished doing it ***'
};

console.log('\nbegin with basic basic');
basic.start()
.then(function () {
	console.log('\nbasic with a name');
	return basic.start('list-all');
})
.then(function () {
	console.log('\nbasic with callback');
	return basic.start(getmycb(basic));
})
.then(function () {
	console.log('\nnamed basic with callback');
	return basic.start('list-all-with-cb', getmycb(basic));
})
.then(function() {
	console.log('\nbasic with command output');
	basic.tuneOutput(0);
	return basic.start();
})
.then(function() {
	console.log('\nbasic with messages');
	basic.tuneOutput(msgs);
	return basic.start();
})
.then(function() {
	console.log('\nbasic with command output and messages');
	basic.tuneOutput(0, msgs);
	return basic.start();
})
.then(function () {
	console.log('\nlog npm update default');
	return withlogs.start();
})
.then(function () {
	console.log('\nlog npm update to named file');
	return withlogs.start('named-task');
})
.then(function () {
	console.log('\nwrite to a named file, but show less hash');
	withlogs.tuneOutput(10);
	return withlogs.start('less-hash');
})
.then(function () {
	console.log('\nmirror npm update to console and named file');
	withlogs.tuneOutput('none');
	return withlogs.start('both');
})
.then(function () {
	console.log('\nshow nothing, but write to a named file');
	withlogs.tuneOutput('full');
	return withlogs.start('redirected-only');
});


function getmycb(cmdtask) {
	var mycmd = cmdtask;
	return function () {
		console.log('done', mycmd.command);
	};
}
