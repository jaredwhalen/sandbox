module.exports = function(gulp, plugins) {
    return function() {
        gulp.src('pymframe/index.html')
            .pipe(plugins.inline({
                base: 'pymframe/'
            }))
            .pipe(gulp.dest('pymframe/'));
    };
};
