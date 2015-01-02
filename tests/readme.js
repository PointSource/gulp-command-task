var CommandTask = require('..');
var gulp = require('gulp');

var listPkgRootWithFullOutput = new CommandTask('ls -Alh', '..');
listPkgRootWithFullOutput.tuneOutput('none');

var listPkgRecursivelyToFile = new CommandTask('ls -ARlh', '..', '.');
var gulptask = listPkgRecursivelyToFile.registerGulpTask('ls-ARlh_package');
listPkgRecursivelyToFile.tuneOutput(10, {
	pre: 'Recursively listing your home directory.',
	post: 'You can find the output in ' + listPkgRecursivelyToFile.name + '.log.'
});

listPkgRootWithFullOutput.start()
.then(function () {
	gulptask.fn();
});
