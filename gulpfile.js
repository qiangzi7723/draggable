var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('script', function() {
    gulp.src('src/draggable.js')
        .pipe(uglify())
        .pipe(rename('draggable.min.js'))
        .pipe(gulp.dest('src'))
})
