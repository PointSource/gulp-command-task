var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var Q = require('q');
var SimpleCommand = require('simple-command');
var util = require('util');

module.exports = CommandTask;


/**
* Creates a command line interface action that will be executed by calling .start()
*
* @param name the name of the action
* 	(can be used as a gulp task name, and will be used as the log file name, if a log directory is provided)
* @param command the command to run, including any arguments and parameters
* @param execDir the directory in which to run the command
* @param logDir (optional) the directory in which to write the log file, if not provide, no log file is created
* @param messages (optional) an object containing any of the following messages\n
* 	pre: a message to output before executing the command\n
* 	post: a message to output after the command completes (successfully)\n
* 	help: a help message to associate with this action (can be used as the the gulp-showhelp help text)
* @param callback (optional) a function to call to fulfill the exec promise when the action completes (successfully)
*/
function CommandTask(name, command, execDir, logDir, messages, callback) {
	// set the required arguments directly
	this.name = name;
	this.command = command;
	this.execDir = execDir;

	// set the optional arguments with some logic-ing
	var last = arguments.length - 1;
	if (typeof arguments[last] === 'function') {
		this.callback = arguments[last];
		last--;
	} else {
		this.callback = undefined;
	}
	if (typeof arguments[last] === 'object') {
		this.messages = arguments[last];
		last--;
	} else {
		this.messages = {
			pre: undefined,
			post: undefined,
			help: undefined
		};
	}
	if (execDir !== arguments[last]) {
		this.logDir = arguments[last];
	} else {
		this.logDir = undefined;
	}

	// set the derived properties
	this.args = this.command.split(' ');
	this.exec = this.args.shift();
}

/**
* Run the action on the CLI.
*
* @return a promise that will be fulfilled when the action completes
* 	(it will be fulfilled with an error if the action fails)
*/
CommandTask.prototype.start = function () {
	var action = this;
	var logfile = action.logDir ? action.logDir + '/' + action.name + '.log' : undefined;
	if (logfile) {
		_startLogfile(logfile,
			'TODO: cd ' + path.resolve(action.execDir) + ' && ' + action.command + '\n\n');
		}
		var command = new simpleCli.SimpleCommand(action.exec, action.args,
			path.resolve(action.execDir), logfile ? path.resolve(logfile) : undefined);
			if (action.messages.pre) {
				console.log(action.messages.pre);
			}
			var execComplete = Q.defer();
			command.run(function(returnCode) {
				if (returnCode !== 0) {
					console.log('An error (errno %d) occurred running `%s`.', returnCode, action.command);
					if (logfile) {
						console.log('Check the log file, %s, for more info.', logfile);
					}
					execComplete.reject(new Error(action.name + ' failed. Error code: ' + returnCode));
					return;
				}
				if (action.messages.post) {
					console.log(action.messages.post);
				}
				if (action.callback) {
					execComplete.resolve(action.callback());
				} else {
					execComplete.resolve();
				}
				return;
			});
			return execComplete.promise;
		};

		/**
		* Creates a gulp task with a name matching this.name
		* and a help message matching this.messages.help,
		* that runs the CommandTask when called.
		*
		* @param deps An array of dependency tasks that should be run before this tasks.
		*/
		CommandTask.prototype.gulptask = function (deps) {
			var action = this;
			deps = deps ? deps : [];
			var task = gulp.task(action.name, deps, function () {
				return action.start();
			});
			if (action.messages.help) {
				task.help = util.format('\n%s\n', action.messages.help);
			}
		};


		function _startLogfile(logfile, text) {
			try {
				fs.renameSync(logfile, logfile + '.bak');
			} catch (err) {
				// silent: logfile didn't exist anyway
			}
			fs.writeFileSync(logfile, text);
		}
