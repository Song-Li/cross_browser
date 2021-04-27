// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');
var path = require('path');

describe('lib/hasbin', function () {
	var fs, hasbin;

	beforeEach(function () {

		process.env.PATH = ['/bin', '/usr/bin', '/usr/local/bin'].join(path.delimiter);

		fs = require('../mock/fs');
		mockery.registerMock('fs', fs);

		fs.stat.withArgs('/usr/bin/foo').yieldsAsync(null, fs.mockStatIsFile);
		fs.stat.withArgs('/usr/bin/baz').yieldsAsync(null, fs.mockStatIsFile);
		fs.stat.withArgs('/usr/bin/error').yieldsAsync(new Error());
		fs.statSync.withArgs('/usr/bin/foo').returns(fs.mockStatIsFile);
		fs.statSync.withArgs('/usr/bin/baz').returns(fs.mockStatIsFile);
		fs.statSync.withArgs('/usr/bin/error').throws(new Error());

		hasbin = require('../../../lib/hasbin');

	});

	it('should be a function', function () {
		assert.isFunction(hasbin);
	});

	it('should have an `async` method which aliases `hasbin`', function () {
		assert.strictEqual(hasbin.async, hasbin);
	});

	describe('hasbin()', function () {
		var passingResult, failingResult, errorResult;

		beforeEach(function (done) {
			hasbin('foo', function (result) {
				passingResult = result;
				hasbin('bar', function (result) {
					failingResult = result;
					hasbin('error', function (result) {
						errorResult = result;
						done();
					});
				});
			});
		});

		it('should call `fs.stat()` and `stat.isFile()` for the binary on each path in `process.env.PATH`', function () {
			assert.callCount(fs.stat, 9);
			assert.calledWith(fs.stat, '/bin/foo');
			assert.calledWith(fs.stat, '/usr/bin/foo');
			assert.calledWith(fs.stat, '/usr/local/bin/foo');
			assert.calledWith(fs.stat, '/bin/bar');
			assert.calledWith(fs.stat, '/usr/bin/bar');
			assert.calledWith(fs.stat, '/usr/local/bin/bar');
			assert.calledWith(fs.stat, '/bin/error');
			assert.calledWith(fs.stat, '/usr/bin/error');
			assert.calledWith(fs.stat, '/usr/local/bin/error');
		});

		it('should callback with `true` if a matching binary is found', function () {
			assert.isTrue(passingResult);
		});

		it('should callback with `false` if a matching binary is not found', function () {
			assert.isFalse(failingResult);
		});

		it('should callback with `false` if an error occurs', function () {
			assert.isFalse(errorResult);
		});

	});

	describe('hasbin() without PATH', function () {
		var oldPath;

		beforeEach(function (done) {
			oldPath = process.env.PATH;
			delete process.env.PATH;
			hasbin('foo', function () {
				done();
			});
		});

		afterEach(function () {
			process.env.PATH = oldPath;
		});

		it('should call `fs.stat()` for the binary alone', function () {
			assert.callCount(fs.stat, 1);
			assert.calledWith(fs.stat, 'foo');
		});
	});

	describe('hasbin() with PATHEXT', function () {
		beforeEach(function (done) {
			process.env.PATHEXT = ['.COM', '.EXE'].join(path.delimiter);
			hasbin('foo', function () {
				done();
			});
		});

		afterEach(function () {
			process.env.PATHEXT = '';
		});

		it('should call `fs.stat()` for the binary on each path in `process.env.PATH` with each extension in `process.env.PATHEXT`', function () {
			assert.callCount(fs.stat, 6);
			assert.calledWith(fs.stat, '/bin/foo.COM');
			assert.calledWith(fs.stat, '/bin/foo.EXE');
			assert.calledWith(fs.stat, '/usr/bin/foo.COM');
			assert.calledWith(fs.stat, '/usr/bin/foo.EXE');
			assert.calledWith(fs.stat, '/usr/local/bin/foo.COM');
			assert.calledWith(fs.stat, '/usr/local/bin/foo.EXE');
		});
	});

	it('should have a `sync` method', function () {
		assert.isFunction(hasbin.sync);
	});

	describe('hasbin.sync()', function () {
		var passingResult, failingResult, errorResult;

		beforeEach(function () {
			passingResult = hasbin.sync('foo');
			failingResult = hasbin.sync('bar');
			errorResult = hasbin.sync('error');
		});

		it('should call `fs.statSync()` and `stat.isFile()` for the binary on each path in `process.env.PATH`', function () {
			assert.callCount(fs.statSync, 8);
			assert.calledWith(fs.statSync, '/bin/foo');
			assert.calledWith(fs.statSync, '/usr/bin/foo');
			assert.neverCalledWith(fs.statSync, '/usr/local/bin/foo');
			assert.calledWith(fs.statSync, '/bin/bar');
			assert.calledWith(fs.statSync, '/usr/bin/bar');
			assert.calledWith(fs.statSync, '/usr/local/bin/bar');
			assert.calledWith(fs.statSync, '/bin/error');
			assert.calledWith(fs.statSync, '/usr/bin/error');
			assert.calledWith(fs.statSync, '/usr/local/bin/error');
		});

		it('should return `true` if a matching binary is found', function () {
			assert.isTrue(passingResult);
		});

		it('should return `false` if a matching binary is not found', function () {
			assert.isFalse(failingResult);
		});

		it('should return `false` if an error occurs', function () {
			assert.isFalse(errorResult);
		});

	});

	it('should have an `all` method', function () {
		assert.isFunction(hasbin.all);
	});

	it('should have an `every` method which aliases `all`', function () {
		assert.strictEqual(hasbin.every, hasbin.all);
	});

	describe('hasbin.all()', function () {
		var passingResult, failingResult;

		beforeEach(function (done) {
			hasbin.async = sinon.stub();
			hasbin.async.withArgs('foo').yieldsAsync(true);
			hasbin.async.withArgs('bar').yieldsAsync(true);
			hasbin.async.withArgs('baz').yieldsAsync(true);
			hasbin.async.withArgs('qux').yieldsAsync(false);
			hasbin.all(['foo', 'bar'], function (result) {
				passingResult = result;
				hasbin.all(['baz', 'qux'], function (result) {
					failingResult = result;
					done();
				});
			});
		});

		it('should call `hasbin.async()` for each binary', function () {
			assert.callCount(hasbin.async, 4);
			assert.calledWith(hasbin.async, 'foo');
			assert.calledWith(hasbin.async, 'bar');
			assert.calledWith(hasbin.async, 'baz');
			assert.calledWith(hasbin.async, 'qux');
		});

		it('should callback with `true` if matching binaries are all found', function () {
			assert.isTrue(passingResult);
		});

		it('should callback with `false` if a matching binary is not found', function () {
			assert.isFalse(failingResult);
		});

	});

	it('should have an `all.sync` method', function () {
		assert.isFunction(hasbin.all.sync);
	});

	it('should have an `every.sync` method which aliases `all.sync`', function () {
		assert.strictEqual(hasbin.every.sync, hasbin.all.sync);
	});

	describe('hasbin.all.sync()', function () {
		var passingResult, failingResult;

		beforeEach(function () {
			hasbin.sync = sinon.stub();
			hasbin.sync.withArgs('foo').returns(true);
			hasbin.sync.withArgs('bar').returns(true);
			hasbin.sync.withArgs('baz').returns(true);
			hasbin.sync.withArgs('qux').returns(false);
			passingResult = hasbin.all.sync(['foo', 'bar']);
			failingResult = hasbin.all.sync(['baz', 'qux']);
		});

		it('should call `hasbin.sync()` for each binary', function () {
			assert.callCount(hasbin.sync, 4);
			assert.calledWith(hasbin.sync, 'foo');
			assert.calledWith(hasbin.sync, 'bar');
			assert.calledWith(hasbin.sync, 'baz');
			assert.calledWith(hasbin.sync, 'qux');
		});

		it('should return `true` if matching binaries are all found', function () {
			assert.isTrue(passingResult);
		});

		it('should return `false` if a matching binary is not found', function () {
			assert.isFalse(failingResult);
		});

	});

	it('should have a `some` method', function () {
		assert.isFunction(hasbin.some);
	});

	it('should have an `any` method which aliases `some`', function () {
		assert.strictEqual(hasbin.any, hasbin.some);
	});

	describe('hasbin.some()', function () {
		var passingResult, failingResult;

		beforeEach(function (done) {
			hasbin.async = sinon.stub();
			hasbin.async.withArgs('foo').yieldsAsync(true);
			hasbin.async.withArgs('bar').yieldsAsync(false);
			hasbin.async.withArgs('baz').yieldsAsync(false);
			hasbin.async.withArgs('qux').yieldsAsync(false);
			hasbin.some(['foo', 'bar'], function (result) {
				passingResult = result;
				hasbin.some(['baz', 'qux'], function (result) {
					failingResult = result;
					done();
				});
			});
		});

		it('should call `hasbin.async()` for each binary', function () {
			assert.callCount(hasbin.async, 4);
			assert.calledWith(hasbin.async, 'foo');
			assert.calledWith(hasbin.async, 'bar');
			assert.calledWith(hasbin.async, 'baz');
			assert.calledWith(hasbin.async, 'qux');
		});

		it('should return `true` if some matching binaries are found', function () {
			assert.isTrue(passingResult);
		});

		it('should return `false` if no matching binaries are found', function () {
			assert.isFalse(failingResult);
		});

	});

	it('should have a `some.sync` method', function () {
		assert.isFunction(hasbin.some.sync);
	});

	it('should have an `any.sync` method which aliases `some.sync`', function () {
		assert.strictEqual(hasbin.any.sync, hasbin.some.sync);
	});

	describe('hasbin.some.sync()', function () {
		var passingResult, failingResult;

		beforeEach(function () {
			hasbin.sync = sinon.stub();
			hasbin.sync.withArgs('foo').returns(true);
			hasbin.sync.withArgs('bar').returns(false);
			hasbin.sync.withArgs('baz').returns(false);
			hasbin.sync.withArgs('qux').returns(false);
			passingResult = hasbin.some.sync(['foo', 'bar']);
			failingResult = hasbin.some.sync(['baz', 'qux']);
		});

		it('should call `hasbin.sync()` for each binary', function () {
			assert.callCount(hasbin.sync, 3);
			assert.calledWith(hasbin.sync, 'foo');
			assert.calledWith(hasbin.sync, 'baz');
			assert.calledWith(hasbin.sync, 'qux');
		});

		it('should return `true` if some matching binaries are found', function () {
			assert.isTrue(passingResult);
		});

		it('should return `false` if no matching binaries are found', function () {
			assert.isFalse(failingResult);
		});

	});

	it('should have a `first` method', function () {
		assert.isFunction(hasbin.first);
	});

	describe('hasbin.first()', function () {
		var passingResult, failingResult;

		beforeEach(function (done) {
			hasbin.async = sinon.stub();
			hasbin.async.withArgs('foo').yieldsAsync(true);
			hasbin.async.withArgs('bar').yieldsAsync(false);
			hasbin.async.withArgs('baz').yieldsAsync(false);
			hasbin.async.withArgs('qux').yieldsAsync(false);
			hasbin.first(['foo', 'bar'], function (result) {
				passingResult = result;
				hasbin.first(['baz', 'qux'], function (result) {
					failingResult = result;
					done();
				});
			});
		});

		it('should call `hasbin.async()` for each binary', function () {
			assert.callCount(hasbin.async, 4);
			assert.calledWith(hasbin.async, 'foo');
			assert.calledWith(hasbin.async, 'bar');
			assert.calledWith(hasbin.async, 'baz');
			assert.calledWith(hasbin.async, 'qux');
		});

		it('should return the name of the first binary if some matching binaries are found', function () {
			assert.strictEqual('foo', passingResult);
		});

		it('should return `false` if no matching binaries are found', function () {
			assert.isFalse(failingResult);
		});
	});

	it('should have a `first.sync` method', function () {
		assert.isFunction(hasbin.first.sync);
	});

	describe('hasbin.first.sync()', function () {
		var passingResult, failingResult;

		beforeEach(function () {
			hasbin.sync = sinon.stub();
			hasbin.sync.withArgs('foo').returns(true);
			hasbin.sync.withArgs('bar').returns(false);
			hasbin.sync.withArgs('baz').returns(false);
			hasbin.sync.withArgs('qux').returns(false);
			passingResult = hasbin.first.sync(['foo', 'bar']);
			failingResult = hasbin.first.sync(['baz', 'qux']);
		});

		it('should call `hasbin.sync()` for each binary', function () {
			assert.callCount(hasbin.sync, 4);
			assert.calledWith(hasbin.sync, 'foo');
			assert.calledWith(hasbin.sync, 'bar');
			assert.calledWith(hasbin.sync, 'baz');
			assert.calledWith(hasbin.sync, 'qux');
		});

		it('should return the name of the first binary if some matching binaries are found', function () {
			assert.strictEqual('foo', passingResult);
		});

		it('should return `false` if no matching binaries are found', function () {
			assert.isFalse(failingResult);
		});

	});

	describe('hasbin() with quotes in PATH', function () {
		var passingResult, oldPath, pathArr;

		beforeEach(function (done) {
			oldPath = process.env.PATH;
			pathArr = process.env.PATH.split(path.delimiter);
			pathArr.push('"/win"');
			process.env.PATH = pathArr.join(path.delimiter);

			fs.stat.withArgs('/win/norf').yieldsAsync(null, fs.mockStatIsFile);
			fs.statSync.withArgs('/win/norf').returns(fs.mockStatIsFile);

			hasbin('norf', function (result) {
				passingResult = result;
				done();
			});
		});

		afterEach(function () {
			process.env.PATH = oldPath;
		});

		it('should return `true` if PATH entries are wrapped in quotes and binaries are found', function () {
			assert.isTrue(passingResult);
		});

	});
});
