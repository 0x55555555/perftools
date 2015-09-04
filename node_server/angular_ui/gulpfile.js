var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var jade = require("gulp-jade");

gulp.task("babel", function () {
  return gulp.src("js/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("all.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task('jade', function() {
  var YOUR_LOCALS = {};

  gulp.src('./templates/*.jade')
    .pipe(jade({
      locals: YOUR_LOCALS
    }))
    .pipe(gulp.dest('./dist/templates'))

    gulp.src('./*.jade')
      .pipe(jade({
        locals: YOUR_LOCALS,
        pretty: true
      }))
      .pipe(gulp.dest('./dist/'))
});

gulp.task('css', function() {
  gulp.src('./css/*.css')
  .pipe(gulp.dest('./dist/css/'));
});

gulp.task('external', function() {
  gulp.src('./external/*')
  .pipe(gulp.dest('./dist/external/'));
});

gulp.task('default', ['external', 'css', 'babel', 'jade']);

gulp.task("watch", function(){
    gulp.watch('css/**/*.css', ['css']);
    gulp.watch('js/**/*.js', ['babel']);
    gulp.watch('**/*.jade', ['jade']);
});
