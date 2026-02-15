const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const babel = require("gulp-babel");
const newer = require("gulp-newer");
const { deleteAsync } = require('del');
const cleanCSS = require('gulp-clean-css');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const npmDist = require('gulp-npm-dist');
const fileinclude = require('gulp-file-include');

const folder = {
    src: "src/",
    build: "build/",
    dist: "build/",
    build_scss: "build/css/",
    build_js: "build/js/",
    build_img: "build/images/",
    build_plugins: "build/plugins/"
};

// Copy ALL third-party libraries from node_modules
const thirdParty = () => {
    console.log('📦 Copying third-party libraries...');

    // Bootstrap
    gulp.src('node_modules/bootstrap/dist/**/*')
        .pipe(gulp.dest(folder.build_plugins + 'bootstrap'));

    gulp.src('node_modules/bootstrap-icons/**/*')
        .pipe(gulp.dest(folder.build_plugins + 'bootstrap-icons'));


    // SimpleBar
    gulp.src('node_modules/simplebar/dist/**/*')
        .pipe(gulp.dest(folder.build_plugins + 'simplebar'));


    // Using npmDist for other packages
    return gulp
        .src(npmDist(), { base: './node_modules', encoding: false })
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '');
        }))
        .pipe(gulp.dest(folder.build_plugins))
        .on('end', () => {
            console.log('✅ All plugins copied!');
        });
};

// Cleaning the dist directory
async function clean() {
    console.log('🧹 Cleaning build directory...');
    await deleteAsync(folder.dist);
    console.log('✅ Build directory cleaned!');
}

// HTML task
function html() {
    console.log('📄 Processing HTML files...');
    var out = folder.dist + "";

    return gulp
        .src([
            folder.src + 'html/**/*.html',
            '!' + folder.src + 'html/**/partials/**'
        ])
        .pipe(fileinclude({
            prefix: '%%',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest(out))
        .on('end', () => {
            console.log('✅ HTML files processed!');
        })
        .pipe(browserSync.stream());
}

// Compile & minify SCSS
async function styles() {
    console.log('🎨 Compiling SCSS...');
    const autoprefixer = (await import('gulp-autoprefixer')).default;
    return gulp
        .src(folder.src + 'scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(folder.build_scss))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(folder.build_scss))
        .on('end', () => {
            console.log('✅ SCSS compiled successfully!');
        })
        .pipe(browserSync.stream());
}

// Compile all JS files (WITHOUT bundle conflict)
function js() {
    console.log('📜 Processing JavaScript files...');
    return gulp
        .src([
            folder.src + "js/**/*.js",
            '!' + folder.src + "js/layout.js",  // Exclude files used in bundle
            '!' + folder.src + "js/main.js"
        ])
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(uglify())
        .on("error", err => console.log(err.toString()))
        .pipe(gulp.dest(folder.build_js))
        .on('end', () => {
            console.log('✅ JavaScript files processed!');
        })
        .pipe(browserSync.stream());
}

// Concat layout.js + main.js into combined file
function jsBundle() {
    console.log('📦 Bundling layout + main JavaScript...');
    return gulp
        .src([
            folder.src + "js/layout.js",
            folder.src + "js/main.js"
        ])
        .pipe(concat("combined.js"))  // Different name to avoid conflict
        .pipe(gulp.dest(folder.build_js))
        .pipe(rename({ basename: "combined", suffix: ".min" }))
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(uglify())
        .on("error", err => console.log(err.toString()))
        .pipe(gulp.dest(folder.build_js))
        .on('end', () => {
            console.log('✅ JavaScript bundled as combined.min.js!');
        })
        .pipe(browserSync.stream());
}

// Image processing
function img() {
    console.log('📸 Copying images...');

    return gulp
        .src(folder.src + "images/**/*.{png,jpg,jpeg,gif,svg,webp,ico,bmp,PNG,JPG,JPEG,GIF,SVG}", {
            allowEmpty: true,
            encoding: false,
            base: folder.src
        })
        .pipe(newer(folder.build_img))
        .pipe(gulp.dest(folder.build))
        .on('end', () => {
            console.log('✅ Images copied successfully!');
        })
        .pipe(browserSync.stream());
}

// Start BrowserSync server
function serve(done) {
    console.log('🚀 Starting development server...');
    browserSync.init({
        server: {
            baseDir: folder.build,
            index: "index.html"
        },
        port: 3000,
        open: true,
        notify: false,
        ui: false,
        ghostMode: false
    });
    console.log('✅ Server started at http://localhost:3000');
    done();
}

// Reload browser
function reload(done) {
    browserSync.reload();
    done();
}

// Watch files
function watch() {
    console.log('👀 Watching files for changes...');
    gulp.watch(folder.src + "html/**/*", gulp.series(html, reload));
    gulp.watch(folder.src + "images/**/*", gulp.series(img, reload));
    gulp.watch(folder.src + "scss/**/*", gulp.series(styles, reload));
    gulp.watch(folder.src + "js/**/*", gulp.series(gulp.parallel(js, jsBundle), reload));
}

// Development task
gulp.task("dev", gulp.series(
    gulp.parallel(thirdParty, html, img, styles, js, jsBundle),
    gulp.parallel(serve, watch)
));

// Build task
gulp.task("build", gulp.series(
    clean,
    gulp.parallel(thirdParty, html, img, styles, js, jsBundle)
));

// Default task
gulp.task("default", gulp.series("dev"));

// Export individual tasks
exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.js = js;
exports.jsBundle = jsBundle;
exports.img = img;
exports.serve = serve;
exports.watch = watch;
exports.thirdParty = thirdParty;
exports.reload = reload;