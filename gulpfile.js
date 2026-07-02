'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(/Warning - \[sass\]/);
build.addSuppression(/Warning - \[package-solution\] Admins can make this solution available/);

build.initialize(require('gulp'));
