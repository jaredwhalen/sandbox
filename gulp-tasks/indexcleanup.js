var del = require('del');

module.exports = function(gulp, plugins) {
    return function() {
        gulp.src('pymframe/index.html')
            .pipe(plugins.removeCode({
                production: true
            }))
            .pipe(plugins.gulpIf('*.html', plugins.htmlmin({
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                preserveLineBreaks: true,
                removeComments: true
            })))
            .pipe(gulp.dest('pymframe'))
        del.sync('pymframe/main.min.js');
        del.sync('pymframe/styles.min.css');

    };
};
