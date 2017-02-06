// third-party dependencies
const gulp       = require('gulp');
const gulpSize   = require('gulp-size');
const gulpUglify = require('gulp-uglify');

const runSequence =  require('run-sequence');

// browserify
const browserify = require('browserify');
const source     = require('vinyl-source-stream');
const buffer     = require('vinyl-buffer');
const gutil      = require('gulp-util');
const brfs       = require('brfs');

// browserSync
const browserSync = require('browser-sync').create();

/**
 * Compile client library
 */
gulp.task('javascript:client', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './browser/index.js',
    // debug: true,
    // defining transforms here will avoid crashing your stream
    transform: [],

    // standalone global object for main module
    standalone: 'HAccountClient'
  });

  return b.bundle()
    .on('error', function (err) {
      gutil.log('Browserify Error', err);
      this.emit('end')
    })
    .pipe(source('h-account-client.js'))
    .pipe(buffer())
    .pipe(gulpUglify())
    // calculate size before writing source maps
    .pipe(gulpSize({
      title: 'javascript:client',
      showFiles: true
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('javascript:client-ui', function () {
  var b = browserify({
    entries: './browser/ui/dialog/index.js',
    transform: [brfs],

    // standalone global object for main module
    standalone: 'HAccountDialog'
  });

  return b.bundle()
    .on('error', function (err) {
      gutil.log('Browserify Error', err);
      this.emit('end');
    })
    .pipe(source('h-account-dialog.js'))
    .pipe(buffer())
    .pipe(gulpUglify())
    .pipe(gulpSize({
      title: 'javascript:client',
      showFiles: true
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('javascript', ['javascript:client', 'javascript:client-ui']);
gulp.task('distribute', ['javascript']);

// Static server
gulp.task('serve:client', function() {
  browserSync.init({
    server: {
      baseDir: ['./demo', './dist']
    },
    open: true
  });
});

/**
 * Watch for changes and auto recompile
 */
gulp.task('watch', function () {

  var clientFiles = [
    'browser/**/*.js',
    'browser/**/*.html',
    'browser/**/*.css',
    'methods/**/*.js',
    'index.js',
    'private.js',
  ];

  gulp.watch(clientFiles, ['javascript']);
  gulp.watch([
    'dist/**/*.js',
    'demo/**/*'
  ], browserSync.reload);
});

/**
 * Main development task
 */
gulp.task('develop', function () {
  runSequence('javascript', 'serve:client', 'watch');
});

gulp.task('default', ['develop']);
