const gulp        = require('gulp')
    , bower_files = require('gulp-bower-files')
    , concat      = require('gulp-concat')
    , jade        = require('gulp-jade')
    , livereload  = require('gulp-livereload')
    , sass        = require('gulp-sass')
    , sourcemaps  = require('gulp-sourcemaps')
    , gutil       = require('gulp-util')
    , path        = require('path')
    ;

gulp.task('bower', function() {
  return bower_files()
    .pipe(gulp.dest('dist/lib/'))
});

gulp.task('css', function() {
  return gulp.src('web/stylesheets/*')
    .pipe(
      sass( {
        includePaths: ['web/stylesheets'],
        errLogToConsole: true
      } ) )
    .pipe( gulp.dest('dist/stylesheets/') )
    .pipe(livereload());
});

gulp.task('js', function() {
  return gulp.src([ 'web/scripts/App.js', 'web/scripts/*.js' ])
		.pipe(sourcemaps.init())
    .pipe( concat('all.min.js'))
		.pipe(sourcemaps.write('.', { sourceRoot: '/source/scripts' }))
    .pipe( gulp.dest('dist/scripts/'))
    .pipe(livereload());
});

gulp.task('templates', function() {
  return gulp.src('web/**/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(livereload());
});

gulp.task('watch', function () {
  livereload.listen();

  gulp.watch('web/stylesheets/**/*', ['css']);
  gulp.watch('web/scripts/**/*', ['js']);
  gulp.watch('web/**/*', ['templates']);
});

// Default Task
gulp.task('default', ['bower', 'js', 'css', 'templates', 'watch']);
