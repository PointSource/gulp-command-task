CommandTask
-----------

###function CommandTask(command, workDir, logDir)###

**CommandTask** -
creates a command line task that can be run from your Node script and provides pretty output

####Parameters####

* **command** *string* the text of the command to run
(including arguments and parameters, if any)
* **workDir** *string* the directory in which to run the command
* **logDir** *string* (optional) the directory in which to write a log file contain the
command's output, if not provide, no log file is created

* * *


###CommandTask.prototype.setLogDir = function (logDir)###

**CommandTask.setLogDir** - sets the output directory for logging the command output

####Parameters####

* **logDir** *string* (optional) the directory in which to write a log file contain the
command's output, if not provide, no log file is created

* * *


###CommandTask.prototype.tuneOutput = function (mask, messages)###

**CommandTask.tuneOutput** -
controls what output is generated, and where it goes, when the task is started<br/>
The default is for command output to be masked with on '#' for each 'chunk' of output.

####Parameters####

* **mask** (optional) sets what to do with the output from the command,
it may have the following values:
	- `'default'` (or `1`): outputs one '#' to show progress for each 'chunk' of output from the command
	- `'none'` (or `0`): shows the full output of the command
	- `'full'` (or `-1`): no output from the command, or any indication of its progress is shown
	- any number, `N > 1`: like 'default', but counts `N` 'chunks' before outputing a '#'

* **messages** *object* (optional) an object containing any of the following messages
* **messages.pre** *string* a message to output before executing the command
* **messages.post** *string* a message to output after the command completes (successfully)

* * *


###CommandTask.prototype.start = function (name, callback)###

**CommandTask.start** - starts the task

####Parameters####

* **name** *string* (optional) the name of the task, if a _logDir_ is provide,
command output will be saved in _$logDir/$name.log_;
if _logDir_ is provided but _name_ is not, command output will be saved in _$logDir/$command.log_
* **callback** *function* (optional) a function to call to fulfill the exec promise when
the task completes (successfully)


####Returns####

*q.Promise* a promise that will be fulfilled when the command completes
(it will be fulfilled with an error if the command fails)
* * *


###CommandTask.prototype.registerGulpTask = function (name, deps, callback)###

**CommandTask.registerGulpTask** - creates a gulp task with a name matching name that runs the
CommandTask when called

####Parameters####

* **name** *string* the name of the gulp task to be created
* **deps** *array* (optional) an array of dependency task names that should be run before
this tasks
* **callback** *function* (optional) a function to be called after the task completes


####Returns####

*gulp.Task* the created gulp task, just in case there's something you want to do with it
* * *
