require('dotenv').config();
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var del = require('del');
var inquirer = require('inquirer');
var versionNumber;

const fs = require("fs");
const gutil = require('gutil');
const ftp = require('vinyl-ftp');

plugins.sass = require('gulp-sass');
plugins.gulpIf = require('gulp-if');
plugins.runSequence = require('run-sequence');
plugins.browserSync = require('browser-sync').create();
plugins.gutil = require('gulp-util');
plugins.inline = require('gulp-inline');
plugins.removeCode = require('gulp-remove-code');
plugins.htmlmin = require('gulp-htmlmin');

function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins);
}



gulp.task('sass', getTask('sass'));
gulp.task('browserSync', getTask('browserSync'));
gulp.task('browserify', getTask('browserify'));
gulp.task('browserifyBuild', getTask('browserifybuild'));
gulp.task('clean', getTask('clean'));
gulp.task('nunjucks', getTask('nunjucks'));
gulp.task('nunjucks-build', getTask('nunjucks-build'));
gulp.task('useref', getTask('useref'));
gulp.task('useref-pym', getTask('useref-pym'));
gulp.task('useref-pym2', getTask('useref-pym2'));
gulp.task('indexcleanup', [
    'useref-pym', 'inline'
], getTask('indexcleanup'));
gulp.task('sass-build', getTask('sass-build'));
gulp.task('inline', getTask('inline'));
gulp.task('inline-pym', getTask('inline-pym'));
gulp.task('pymtoolclean', [
    'useref-pym2', 'inline-pym'
], getTask('pymtoolclean'));

gulp.task('inq', function(done) {
    'use strict';
    var questions = [
        {
            type: 'input',
            name: 'version_number',
            message: 'What is the # file version?'
        }
    ];
    inquirer.prompt(questions).then(function(answers) {
        JSON.stringify(answers, null, '  ')
        versionNumber = answers.version_number;
        done();
    });
})

gulp.task('setName', function() {
    var config = require("./project.json");
    var settings = require("./package.json");
    var name;

    if (config.projectName) {
        name = config.projectName;
    } else {
        name = settings.name;
    }
    return gulp.src("./pymframe/index.html").pipe(rename(function(path) {
        // path.basename = name;
        // path.basename += "-" + versionNumber;
        path.basename = 'index'
        path.extname = ".html"
    // })).pipe(gulp.dest("./pymframe"));
      })).pipe(gulp.dest(""));
})

gulp.task('delIndex', function() {
    return del.sync('pymframe/index.html');
});
gulp.task('rename', function(callback) {
    plugins.runSequence('setName', 'delIndex', callback)
})

// gulp.task('browserify', function() {
//     return browserify({'entries': ['app/js/main.js']}).transform(stringify, {
//         appliesTo: {
//             includeExtensions: ['.html']
//         }
//     }).transform(babelify, {presets: ["env"]}).bundle().pipe(source('main.js')).pipe(buffer()).pipe(gulp.dest('.tmp/js')).pipe(plugins.browserSync.reload({stream: true}))
// });

// gulp.task('browserifyBuild', function() {
//     return browserify({'entries': ['app/js/main.js']}).transform(stringify, {
//         appliesTo: {
//             includeExtensions: ['.html']
//         }
//     }).transform(babelify, {presets: ["env"]}).bundle().pipe(source('main.js')).pipe(buffer()).pipe(uglify({mangle: false, compress: false}).on('error', plugins.gutil.log)).pipe(gulp.dest('.tmp/js'))
// });

gulp.task('watch', [
    'browserSync', 'sass', 'nunjucks'
], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/**/*.html', ['nunjucks']);
    gulp.watch('app/js/**/*.js', ['browserify']);
    gulp.watch('app/js/**/*.html', ['browserify']);
    gulp.watch('app/js/**/*.json', ['browserify']);
    gulp.watch('app/data/**/*.json', ['browserify']);
});

gulp.task('default', function(callback) {
    plugins.runSequence([
        'sass', 'browserify', 'nunjucks', 'browserSync', 'watch'
    ], callback)
})

gulp.task('build', function(callback) {
    plugins.runSequence('clean', 'browserifyBuild', [
        'sass-build', 'nunjucks-build'
    ], 'useref-pym', 'inline-pym', 'indexcleanup', 'inq', 'rename', callback)
})

gulp.task('pymtool', function(callback) {
    plugins.runSequence('clean', 'browserifyBuild', [
        'sass-build', 'nunjucks-build'
    ], 'useref-pym2', 'inline', 'pymtoolclean', callback)
})



const user = process.env.FTP_USER;
const pwd = process.env.FTP_PWD;



const localBuild = [
    'pymframe/**/*'
];

const remoteLocation = 'embeds/graphics/iframes/';

function getFtpConnection(){
    return ftp.create({
        host: 'ftp-content.gbahn.net',
        port: 21,
        user: user,
        password: pwd,
        parallel: 5,
        log: gutil.log
    })
}

//deploy to remote server
gulp.task('deploy',function(){
  console.log(user)
    var conn = getFtpConnection();
    return gulp.src(localBuild, {base: './pymframe/', buffer: false})
        .pipe(conn.newer(remoteLocation))
        .pipe(conn.dest(remoteLocation))
})
