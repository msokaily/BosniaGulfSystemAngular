const gulp = require("gulp");
const inline = require("gulp-inline");

gulp.task("default", () => {
  return gulp
    .src("./src/main.js")
    .pipe(inline())
    .pipe(gulp.dest("./single-dist"));
});