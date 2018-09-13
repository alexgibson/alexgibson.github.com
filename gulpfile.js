'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const eslint = require('gulp-eslint');
const htmlmin = require('gulp-html-minifier');
const del = require('del');
const runSequence = require('run-sequence');
const ghpages = require('gh-pages');

const dist = '_site';

gulp.task('deploy', ['site:build'], () => {
    ghpages.publish(dist, function(err) {
        console.error(err); // eslint-disable-line no-console
    });
});

gulp.task('jekyll:build', (gulpCallBack) => {
    let spawn = require('child_process').spawn;
    let jekyll = spawn('bundle', ['exec', 'jekyll', 'build'], {stdio: 'inherit'});

    jekyll.on('exit', (code) => {
        gulpCallBack(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
    });
});

gulp.task('site:build', (callback) => {
    runSequence('clean', ['js:lint'], 'jekyll:build', 'minify:html', callback);
});

gulp.task('minify:html', () => {
    gulp.src('./_site/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true }))
        .pipe(gulp.dest('./_site'));
});

gulp.task('js:lint', () => {
    return gulp.src(['gulpfile.js', './_assets/js/*.js', '!./_assets/js/lib/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('clean', () => {
    return del(['_site/**']);
});

gulp.task('default', () => {
    watch(['./_assets/js/*.js'], () => {
        gulp.start('js:lint');
    });
});
