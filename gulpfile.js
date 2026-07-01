'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppressRule(/Warning - \[sass\]/);

build.initialize(require('gulp'));
