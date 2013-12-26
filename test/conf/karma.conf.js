// Karma configuration
// Generated on Tue Jun 04 2013 13:29:36 GMT+0900 (대한민국 표준시)


// base path, that will be used to resolve files and exclude
basePath = '../..';


// list of files / patterns to load in the browser
files = [
  QUNIT,
  QUNIT_ADAPTER,
  'src/namespace.js',
  'src/core/Core.js',
  'src/datatype/Object.js',
  'src/datatype/Function.js',
  'src/datatype/Array.js',
  'src/datatype/String.js',
  'src/datatype/Argument.js',
  'src/datatype/Number.js',
  'src/dataType/Prototype.js',
  'src/bom/bom.js',
  'src/event/Event.js',
  'src/dom/Element.js',
  'src/util/utils.js',
  'src/util/Callbacks.js',
  'src/util/Promise.js',
  'src/base/base.js',
  'src/ajax/Ajax.js',
  'src/history/History.js',
  'src/dom/Template.js',
  'test/**/*Test.js'
];

// list of files to exclude
exclude = [
  
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];

// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome', 'Firefox', 'IE'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
