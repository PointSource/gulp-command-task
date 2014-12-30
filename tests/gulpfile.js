var gulp = require('gulp');
var ghelp = require('gulp-showhelp');
var runSeq = require('run-sequence');

var CommandTask = require('../');

gulp.task('help', function () {
	ghelp.show();
})
.help = 'Shows this message.';

var listPkgRoot = new CommandTask('ls -Alh', '..');
listPkgRoot.tuneOutput('none', {
	pre: 'listing the contents of the package root'
});
listPkgRoot.registerGulpTask('list-pkg-root')
.help = 'Lists the contents of this package\'s root.';

var listPkg = new CommandTask('ls -AlhR', '..', '.');
listPkg.registerGulpTask('list-package', [listPkgRoot.name])
.help = 'Lists the package contents.' +
	'\n(The top-level listing is printed to screen, through the "' + listPkgRoot.name + '" task, ' +
	'and the recursive listing is sent to ' + listPkg.name + '.log.)';
listPkg.tuneOutput({
	pre: 'listing the contents of the package',
	post: 'find the complete package listing in ' + listPkg.name + '.log',
});

gulp.task('default', ['help'], function (cb) {
	runSeq([
		listPkg.name
	]);
})
.help = 'Runs all tests, including showing help.';
