'use strict';

var async = require('async');
var fs = require('fs');
var path = require('path');

module.exports = hasbin;
hasbin.async = hasbin;
hasbin.sync = hasbinSync;
hasbin.all = hasbinAll;
hasbin.all.sync = hasbinAllSync;
hasbin.some = hasbinSome;
hasbin.some.sync = hasbinSomeSync;
hasbin.first = hasbinFirst;
hasbin.first.sync = hasbinFirstSync;

hasbin.every = hasbin.all;
hasbin.any = hasbin.some;

function hasbin (bin, done) {
	async.some(getPaths(bin), fileExists, done);
}

function hasbinSync (bin) {
	return getPaths(bin).some(fileExistsSync);
}

function hasbinAll (bins, done) {
	async.every(bins, hasbin.async, done);
}

function hasbinAllSync (bins) {
	return bins.every(hasbin.sync);
}

function hasbinSome (bins, done) {
	async.some(bins, hasbin.async, done);
}

function hasbinSomeSync (bins) {
	return bins.some(hasbin.sync);
}

function hasbinFirst (bins, done) {
	async.detect(bins, hasbin.async, function (result) {
		done(result || false);
	});
}

function hasbinFirstSync (bins) {
	var matched = bins.filter(hasbin.sync);
	return matched.length ? matched[0] : false;
}

function getPaths (bin) {
	var envPath = (process.env.PATH || '');
	var envExt = (process.env.PATHEXT || '');
	return envPath.replace(/["]+/g, '').split(path.delimiter).map(function (chunk) {
		return envExt.split(path.delimiter).map(function (ext) {
			return path.join(chunk, bin + ext);
		});
	}).reduce(function (a, b) {
		return a.concat(b);
	});
}

function fileExists (filePath, done) {
	fs.stat(filePath, function (error, stat) {
		if (error) {
			return done(false);
		}
		done(stat.isFile());
	});
}

function fileExistsSync (filePath) {
	try {
		return fs.statSync(filePath).isFile();
	} catch (error) {
		return false;
	}
}
