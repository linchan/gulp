// 引入 gulp
var gulp = require('gulp'); 

// 引入组件
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('path');
var chalk = require('chalk');
var minify = require('gulp-minify-css');
var inject = require("gulp-inject");

// default 
var injectCfg = "injectCfg.json",
    injectionDefault = ["src/jq.js","src/t.js","src/cobra.js","style/pure.min.css","style/default.css","style/seller.css"],
    gDest = "bin";


// 检查脚本
gulp.task('lint', function() {
    gulp.src('./src/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 编译Less
gulp.task('less', function() {
    gulp.src('./src/css/less/_*.less')
        .pipe(rename(function(path){
            path.basename=path.basename.replace(/^_/,'');
        }))
        .pipe(less())
        .pipe(minify())
        .pipe(gulp.dest('./bin/css/'));
});

// 合并，压缩文件
gulp.task('scripts', function() {
    gulp.src('./src/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./bin/js'));
});

// 模板
gulp.task('tpl',function(){
    // console.log(require('injectCfg.json'));
    var tplTarget = gulp.src('./src/tpl/*.html');
    var tplSources = gulp.src(['./bin/js/*.js', './bin/css/*.css'], {read: false});
    return tplTarget.pipe(inject(tplSources))
       .pipe(gulp.dest('./bin/tpl'));
})

gulp.task('cfg',function(){
    gulp.src('./files.json')
        .pipe(inject(gulp.src(['./bin/js/*.js', './bin/css/*.css', './bin/tpl/*.html'], {read: false}), {
        starttag: '"{{ext}}": [',
        endtag: ']',
        transform: function (filepath, file, i, length) {
          return '  "' + filepath + '"' + (i + 1 < length ? ',' : '');
        }
        }))
        .pipe(gulp.dest('./'));
})

gulp.task('watch',function() {
    var watchCss = gulp.watch('./src/css/less/*.less',['less'])
    var watchJs = gulp.watch('./src/js/*.js',['scripts'])
    var watchTpl = gulp.watch('./src/tpl/*.html',['tpl'])
    watchCss.on('change',function(event){
        console.log("file: "+chalk.red.bold(event.path)+" has changed!");
    });
    watchJs.on('change',function(event) {
        console.log("file: "+chalk.red.bold(event.path)+" has changed!");
    });
    watchTpl.on('change',function(event){
        console.log("file: "+chalk.red.bold(event.path)+" has changed!");
    });
})

// 默认任务
gulp.task('default',['lint','less','scripts','tpl','watch'],function(){
    console.log(chalk.red.bold("************ ")+chalk.green.bgGreen.bold("start watch")+chalk.red.bold(" ************"));
});