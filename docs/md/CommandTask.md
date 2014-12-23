CommandTask
-----------

###function CommandTask(command, workDir, logDir, messages)###

Creates a command line task that can be run from your Node script and provides pretty output.

####Parameters####

* command the text of the command to run (including arguments and parameters, if any)
* workDir the directory in which to run the command
* logDir (optional) the directory in which to write the log file,
if not provide, no log file is created
* messages (optional) an object containing any of the following messages
* messages.pre a message to output before executing the command
* messages.post a message to output after the command completes (successfully)
* messages.help a help message to associate with this command
(can be used as the the gulp-showhelp help text)


###CommandTask.prototype.start = function (name, callback)###

Run the task on the CLI.

####Parameters####

* name (optional) the name of the task, if a _logDir_ is provide, command output will be
saved in _$logDir/$name.log_; if _logDir_ is provided but _name_ is not, command output will be
saved in _$logDir/$command.log_
* callback (optional) a function to call to fulfill the exec promise when the task completes
(successfully)

####Returns####

a promise that will be fulfilled when the command completes
(it will be fulfilled with an error if the command fails)


###CommandTask.prototype.registerGulpTask = function (name, deps, callback)###

Creates a gulp task with a name matching name and a help message matching this.messages.help,
assuming either exist, that runs the CommandTask when called.

####Parameters####

* name the name of the gulp task
* deps (optional) an array of dependency tasks that should be run before this tasks
* callback (optional) a function to be called after the task completes
