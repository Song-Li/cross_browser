'use strict';

var sinon = require('sinon');

var fs = module.exports = {
	stat: sinon.stub(),
	statSync: sinon.stub(),
	mockStatIsFile: {
		isFile: sinon.stub().returns(true)
	},
	mockStatIsNotFile: {
		isFile: sinon.stub().returns(false)
	}
};

fs.stat.yieldsAsync(null, fs.mockStatIsNotFile);
fs.statSync.returns(fs.mockStatIsNotFile);
