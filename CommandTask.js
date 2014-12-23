var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var Q = require('q');
var SimpleCommand = require('simple-command');
var util = require('util');

module.exports = CommandTask;


/**
* Creates a command line task that can be run from your Node script and provides pretty output.
*
* @param command the text of the command to run (including arguments and parameters, if any)
* @param workDir the directory in which to run the command
* @param logDir (optional) the directory in which to write the log file,
* if not provide, no log file is created
* @param messages (optional) an object containing any of the following messages
* @param messages.pre a message to output before executing the command
* @param messages.post a message to output after the command completes (successfully)
* @param messages.help a help message to associate with this command
* (can be used as the the gulp-showhelp help text)
*/
function CommandTask(command, workDir, logDir, messages) {
	// set the required arguments directly
	this.command = command;
	this.workDir = workDir;

	// handle the various cases for optional parameters
	if (typeof logDir === 'object') {
		messages = logDir;
		logDir = null;
	}
	this.logDir = logDir;
	this.messages = messages ? messages :  {
		pre: undefined,
		post: undefined,
		help: undefined
	};

	// set the derived properties
	this.args = this.command.split(' ');
	this.exec = this.args.shift();
}

/**
* Run the task on the CLI.
*
* @param name (optional) the name of the task, if a _logDir_ is provide, command output will be
* saved in _$logDir/$name.log_; if _logDir_ is provided but _name_ is not, command output will be
* saved in _$logDir/$command.log_
* @param callback (optional) a function to call to fulfill the exec promise when the task completes
* (successfully)
*
* @return a promise that will be fulfilled when the command completes
* (it will be fulfilled with an error if the command fails)
*/
CommandTask.prototype.start = function (name, callback) {
	var cmdtask = this;
	var logfile = cmdtask.logDir ? cmdtask.logDir + '/' + cmdtask.name + '.log' : undefined;
	if (logfile) {
		startLogfile(logfile,
			'TODO: cd ' + path.resolve(cmdtask.workDir) + ' && ' + cmdtask.command + '\n\n');
	}
	var command = new SimpleCommand(cmdtask.exec, cmdtask.args,
		path.resolve(cmdtask.workDir), logfile ? path.resolve(logfile) : undefined);
	if (cmdtask.messages.pre) {
		console.log(cmdtask.messages.pre);
	}
	var execComplete = Q.defer();
	command.run(function(returnCode) {
		if (returnCode !== 0) {
			console.log('An error (errno %d) occurred running `%s`.', returnCode, cmdtask.command);
			if (logfile) {
				console.log('Check the log file, %s, for more info.', logfile);
			}
			execComplete.reject(new Error(cmdtask.name + ' failed. Error code: ' + returnCode));
			return;
		}
		if (cmdtask.messages.post) {
			console.log(cmdtask.messages.post);
		}
		if (cmdtask.callback) {
			execComplete.resolve(cmdtask.callback());
		} else {
			execComplete.resolve();
		}
		return;
	});
	return execComplete.promise;
};

/**
* Creates a gulp task with a name matching name and a help message matching this.messages.help,
* assuming either exist, that runs the CommandTask when called.
*
* @param name the name of the gulp task
* @param deps (optional) an array of dependency tasks that should be run before this tasks
* @param callback (optional) a function to be called after the task completes
*/
CommandTask.prototype.registerGulpTask = function (name, deps, callback) {
	if (typeof deps === 'function' || !deps) {
		callback = deps;
		deps = [];
	}
	var cmdtask = this;
	var gulptask = gulp.task(name, deps, function () {
		return cmdtask.start(name, callback);
	});
	if (cmdtask.messages.help) {
		gulptask.help = util.format('\n%s\n', cmdtask.messages.help);
	}
};


function startLogfile(logfile, text) {
	try {
		fs.renameSync(logfile, logfile + '.bak');
	} catch (err) {
		// silent: logfile didn't exist anyway
	}
	fs.writeFileSync(logfile, text);
}
