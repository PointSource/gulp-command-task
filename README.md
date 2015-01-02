# gulp-command-task

Execute command line processes from a gulp task (have it look pretty and do logging, if you like).

## usage

get it: `npm install --save gulp-command-task`

use it:

```javascript
var CommandTask = require('gulp-command-task');
var gulp = require('gulp');

var listPkgRootWithFullOutput = new CommandTask('ls -Alh', '.');
listPkgRootWithFullOutput.tuneOutput('none');

var listPkgRecursivelyToFile = new CommandTask('ls -ARlh', '.', '.');
var gulptask = listPkgRecursivelyToFile.registerGulpTask('ls-ARlh_package');
listPkgRecursivelyToFile.tuneOutput(10, {
	pre: 'Recursively listing your home directory.',
	post: 'You can find the output in ' + listPkgRecursivelyToFile.name + '.log.'
});

listPkgRootWithFullOutput.start()
.then(function () {
	gulptask.fn();
});
```

## docs

[Generated API Docs](docs/md/CommandTask.md).

## more examples?

Check out the [tests](tests/).
