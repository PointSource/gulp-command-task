var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var Q = require('q');
var SimpleCommand = require('simple-command');

module.exports = CommandTask;

/**
 * **CommandTask** -
 * creates a command line task that can be run from your Node script and provides pretty output
 *
 * @param  {string} **command** the text of the command to run
 * (including arguments and parameters, if any)
 * @param  {string} **workDir** the directory in which to run the command
 * @param  {string} **logDir** (optional) the directory in which to write a log file contain the
 * command's output, if not provide, no log file is created
 *
 */
function CommandTask(command, workDir, logDir) {
	// set the required arguments directly
	this.command = command;
	this.workDir = workDir;

	// set the derived properties
	this.args = this.command.split(' ');
	this.exec = this.args.shift();

	// the default outputs
	this.setLogDir(logDir);
	this.tuneOutput();
}

/**
 * **CommandTask.setLogDir** - sets the output directory for logging the command output
 *
 * @param  {string} **logDir** (optional) the directory in which to write a log file contain the
 * command's output, if not provide, no log file is created
 *
 */
CommandTask.prototype.setLogDir = function (logDir) {
	this.logDir = logDir;
};

/**
 * **CommandTask.tuneOutput** -
 * controls what output is generated, and where it goes, when the task is started<br/>
 * The default is for command output to be masked with on '#' for each 'chunk' of output.
 *
 * @param  **mask** (optional) sets what to do with the output from the command,
 * it may have the following values:
 * 	- `'default'` (or `1`): outputs one '#' to show progress for each 'chunk' of output from the command
 * 	- `'none'` (or `0`): shows the full output of the command
 * 	- `'full'` (or `-1`): no output from the command, or any indication of its progress is shown
 * 	- any number, `N > 1`: like 'default', but counts `N` 'chunks' before outputing a '#'
 *
 * @param  {object} **messages** (optional) an object containing any of the following messages
 * @param  {string} **messages.pre** a message to output before executing the command
 * @param  {string} **messages.post** a message to output after the command completes (successfully)
 *
 */
CommandTask.prototype.tuneOutput = function (mask, messages) {
	if (typeof mask === 'object') {
		messages = mask;
		mask = undefined;
	}
	// set the mask as a number
	if (typeof mask === 'number') {
		this.outputMask = mask;
	} else {
		if (mask === 'none') {
			this.outputMask = 0;
		} else if (mask === 'full') {
			this.outputMask = -1;
		} else {
			// use the default
			this.outputMask = 1;
		}
	}
	// set the messages (as an object of undefined values, if needed)
	this.messages = messages ? messages :  {
		pre: undefined,
		post: undefined
	};
};

/**
 * **CommandTask.start** - starts the task
 *
 * @param  {string} **name** (optional) the name of the task, if a _logDir_ is provide,
 * command output will be saved in _$logDir/$name.log_;
 * if _logDir_ is provided but _name_ is not, command output will be saved in _$logDir/$command.log_
 * @param  {function} **callback** (optional) a function to call to fulfill the exec promise when
 * the task completes (successfully)
 *
 * @return {q.Promise} a promise that will be fulfilled when the command completes
 * (it will be fulfilled with an error if the command fails)
 */
CommandTask.prototype.start = function (name, callback) {
	if (typeof name === 'function' || !name) {
		callback = name;
		name = this.command.replace(/\W/g, '-');
	}
	var logfile = getLogfile(this, name);
	var command = new SimpleCommand(this.exec, this.args, path.resolve(this.workDir));
	if (this.messages.pre) {
		console.log(this.messages.pre);
	}
	var cmdtask = this;
	var execComplete = Q.defer();
	command.run(getCommandOptions(cmdtask.outputMask, logfile), function(returnCode) {
		if (returnCode !== 0) {
			console.log('An error (errno %d) occurred running `%s`.', returnCode, cmdtask.command);
			if (logfile) {
				console.log('Check the log file, %s, for more info.', logfile);
			}
			execComplete.reject(new Error(name + ' failed. Error code: ' + returnCode));
			return;
		}
		if (cmdtask.messages.post) {
			console.log(cmdtask.messages.post);
		}
		if (callback) {
			execComplete.resolve(callback());
		} else {
			execComplete.resolve();
		}
		return;
	});
	return execComplete.promise;
};

/**
 * **CommandTask.registerGulpTask** - creates a gulp task with a name matching name that runs the
 * CommandTask when called
 *
 * @param  {string} **name** the name of the gulp task to be created
 * @param  {array} **deps**  (optional) an array of dependency task names that should be run before
 * this tasks
 * @param  {function} **callback** (optional) a function to be called after the task completes
 *
 * @return {gulp.Task} the created gulp task, just in case there's something you want to do with it
 */
CommandTask.prototype.registerGulpTask = function (name, deps, callback) {
	this.name = name;
	if (typeof deps === 'function' || !deps) {
		callback = deps;
		deps = [];
	}
	var cmdtask = this;
	gulp.task(name, deps, function () {
		return cmdtask.start(name, callback);
	});
	return gulp.tasks[name];
};

function getLogfile(cmdtask, taskName) {
	var logfile = cmdtask.logDir ? cmdtask.logDir + '/' + taskName + '.log' : null;
	if (logfile) {
		startLogfile(logfile,
			'TODO: cd ' + path.resolve(cmdtask.workDir) + ' && ' + cmdtask.command + '\n\n');
	}
	return logfile;
}

function startLogfile(logfile, placeholderText) {
	try {
		fs.renameSync(logfile, logfile + '.bak');
	} catch (err) {
		// silent: logfile didn't exist anyway
	}
	fs.writeFileSync(logfile, placeholderText);
}

function getCommandOptions(outputMask, logfile) {
	// most common mapping
	var cmdopts = {
		redirect: logfile,
		progress: outputMask > 0 ? outputMask : false,
		record: null
	};
	// when there's no output mask we've got a special case
	if (outputMask === 0) {
		if (logfile) {
			// set the record so output goes to file and to the console
			cmdopts.redirect = null;
			cmdopts.record = logfile;
		} else {
			// require progress
			cmdopts.progress = true;
		}
	}
	return cmdopts;
}
