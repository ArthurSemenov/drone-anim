"use strict";

const gulp = require("gulp");
const $ = require("gulp-load-plugins")();
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync");
const cleanCSS = require("gulp-clean-css");
const cheerio = require("gulp-cheerio");
const del = require("del");
const imagemin = require("gulp-imagemin");
const path = require("path");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const posthtmlAttrsSorter = require("posthtml-attrs-sorter");
const fileinclude = require('gulp-file-include');
const replace = require("gulp-replace");
const runSequence = require("gulp4-run-sequence");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const svgmin = require("gulp-svgmin");
const reload = browserSync.reload;
const webp = require("gulp-webp");
const tinypng = require("gulp-tinypng-compress");

// Plugins options
// fetch command line arguments
const arg = ((argList) => {
    let arg = {},
        a,
        opt,
        thisOpt,
        curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, "");

        if (opt === thisOpt) {
            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;
        } else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }
    return arg;
})(process.argv);

if (typeof arg.p === "boolean" || typeof arg.p === "undefined") {
    arg.p = "";
} else {
    arg.p = arg.p + "/";
}

if (typeof arg.s === "boolean" || typeof arg.s === "undefined") {
    arg.s = "*";
}

const sourceFolder = "./";
const distFolder = "./";

const options = {
    src: {
        // Source paths
        html: arg.p + sourceFolder + "templates-page/*.html",
        js: arg.p + sourceFolder + "js/**/*.js",
        style: arg.p + sourceFolder + "scss/" + arg.s + ".scss",
        img: arg.p + sourceFolder + "images/**/*.{svg,png,jpg}",
        favicon: arg.p + sourceFolder + "images/favicon/*.*",
        uploads: arg.p + sourceFolder + "uploads/**/*.*",
        svg: arg.p + sourceFolder + "images/svg/**/!(icon-sprite).svg",
        fonts: arg.p + sourceFolder + "fonts/**/*",
        static: arg.p + sourceFolder + "media/**/*",
    },

    watch: {
        // Watch files
        html: [arg.p + sourceFolder + "templates-page/*.html", arg.p + sourceFolder + "templates-parts/*.html"],
        js: arg.p + sourceFolder + "js/**/*.js",
        style: arg.p + sourceFolder + "scss/**/*.scss",
        img: arg.p + sourceFolder + "images/**/*.*",
        uploads: arg.p + sourceFolder + "uploads/**/*.*",
        svg: arg.p + sourceFolder + "images/svg/**/!(icon-sprite).svg",
        fonts: arg.p + sourceFolder + "fonts/**/*",
        static: arg.p + sourceFolder + "media/**/*",
    },

    dist: {
        // Dist paths
        html: arg.p + distFolder + "./",
        js: arg.p + distFolder + "js/",
        css: arg.p + distFolder + "css/",
        img: arg.p + distFolder + "images/",
        favicon: arg.p + distFolder + "images/favicon/",
        uploads: arg.p + distFolder + "uploads/",
        icons: arg.p + "images/svg/",
    },

    svgSprite: {
        title: "Icon %f",
        id: "icon-%f",
        className: "icon-%f",
        svgClassname: "icons-sprite",
        templates: [
            path.join(
                __dirname,
                arg.p + sourceFolder + "scss/core/_icons-template.scss"
            ),
            path.join(
                __dirname,
                arg.p + sourceFolder + "images/svg/icons-template.svg"
            ),
        ],
    },

    imagemin: {
        images: [
            $.imagemin.gifsicle({
                interlaced: true,
                optimizationLevel: 3,
            }),
            $.imagemin.mozjpeg({
                quality: 91,
                progressive: true,
            }),
            $.imagemin.optipng({
                optimizationLevel: 5,
            }),
            $.imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { removeDimensions: true },
                    { cleanupIDs: false },
                ],
            }),
        ],

        icons: [
            $.imagemin.svgo({
                plugins: [
                    { removeTitle: false },
                    { removeStyleElement: false },
                    {
                        removeAttrs: {
                            attrs: [
                                "id",
                                "class",
                                "data-name",
                                "fill",
                                "fill-rule",
                            ],
                        },
                    },
                    { removeEmptyContainers: true },
                    { sortAttrs: true },
                    { removeUselessDefs: true },
                    { removeEmptyText: true },
                    { removeEditorsNSData: true },
                    { removeEmptyAttrs: true },
                    { removeHiddenElems: true },
                    { transformsWithOnePath: true },
                ],
            }),
        ],

        plumber: {
            errorHandler: errorHandler,
        },
    },

    posthtml: {
        plugins: [
            posthtmlAttrsSorter({
                order: [
                    "class",
                    "id",
                    "name",
                    "data",
                    "ng",
                    "src",
                    "for",
                    "type",
                    "href",
                    "values",
                    "title",
                    "alt",
                    "role",
                    "aria",
                ],
            }),
        ],
        options: {},
    },

    htmlPrettify: {
        indent_char: " ",
        indent_size: 4,
    },

    del: [arg.p + distFolder, "!" + arg.p + "dist/robots.txt"],
};

// configuration for localhost
var configServer = {
    server: {
        baseDir: "./"
    },
    host: "localhost",
    port: 8080,
    open: true,
    notify: false,
};

// Error handler for gulp-plumber
function errorHandler(err) {
    $.util.log(
        [(err.name + " in " + err.plugin).bold.red, "", err.message, ""].join(
            "\n"
        )
    );

    this.emit("end");
}

/* All tasks */

// livereload
gulp.task("webserver", function () {
    browserSync.init(configServer);
});

gulp.task("js:build", function () {
    return (
        gulp
            .src(options.src.js)
            //.pipe(rigger())
            //.pipe($.sourcemaps.init())
            //.pipe($.uglify())
            //.pipe($.sourcemaps.write())
            .pipe(gulp.dest(options.dist.js))
            .pipe(reload({ stream: true }))
    );
});

gulp.task("style:build", function () {
    return (
        gulp.src(options.src.style)
            .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
            .pipe(sass().on("error", sass.logError))
            //.pipe(sourcemaps.init())
            .pipe(autoprefixer())
            //.pipe(postcss(plugins))
            //.pipe(sourcemaps.write('.'))
            .pipe(plumber.stop())
            .pipe(gulp.dest(options.dist.css))
            .pipe(reload({ stream: true }))
    );
});

gulp.task("style:min", function () {
    return gulp
        .src(options.src.style)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(
            cleanCSS({ debug: true }/*, function (details) {
                console.log(details.name + ": " + details.stats.originalSize);
                console.log(details.name + ": " + details.stats.minifiedSize);
            }*/)
        )
        .pipe(plumber.stop())
        .pipe(gulp.dest(options.dist.css))
        .pipe(reload({ stream: true }));
});

gulp.task("html:build", function () {
    return (
        gulp
            .src([options.src.html])
            .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))
            //.pipe($.posthtml(options.posthtml.plugins, options.posthtml.options))
            //.pipe($.prettify(options.htmlPrettify))
            .pipe(gulp.dest(options.dist.html))
            .pipe(reload({ stream: true }))
    );
});

gulp.task("icons:build", function () {
    return gulp
        .src([options.src.svg, "!icons-template.svg",])
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(
            cheerio({
                /*run: function ($) {
              $('[fill]').removeAttr('fill');
              $('[style]').removeAttr('style');
            },*/
                parserOptions: { xmlMode: true },
            })
        )
        .pipe(replace("&gt;", ">"))
        .pipe(
            svgmin(function (file) {
                const prefix = path.basename(
                    file.relative,
                    path.extname(file.relative)
                );

                return {
                    plugins: [
                        {
                            removeDoctype: true,
                        },
                        {
                            removeComments: true,
                        },
                        {
                            removeUselessStrokeAndFill: false,
                        },
                        {
                            cleanupNumericValues: {
                                floatPrecision: 2,
                            },
                        },
                        {
                            convertColors: {
                                names2hex: true,
                                rgb2hex: true,
                            },
                        },
                        {
                            cleanupIDs: {
                                prefix: prefix + '-',
                                minify: true,
                            },
                        },
                    ],
                }
            })
        )
        .pipe($.svgSymbols(options.svgSprite))
        .pipe(
            $.if(
                /\.svg$/,
                $.rename({
                    basename: "icon-sprite",
                    extname: ".svg",
                })
            )
        )
        .pipe($.if(/\.svg/, gulp.dest(options.dist.icons)));
});

gulp.task("image:webp", () =>
    gulp
        .src([arg.p + sourceFolder + "images/**/*.{png,jpg}"], {
        //.src([options.src.img, "!**/*.svg", "!" + options.src.favicon], {
            base: arg.p + "src",
        })
        .pipe(
            webp({
                quality: 100,
                method: 6,
                nearLossless: 0
            })
        )
        .pipe(gulp.dest(options.dist.img))
);

gulp.task(
    "image:copy",
    gulp.series("image:webp", () =>
        gulp
            .src(
                [options.src.img, options.src.favicon, "!" + options.src.svg],
                { base: arg.p + "src" }
            )
            .pipe(gulp.dest(options.dist.html))
            .pipe(reload({ stream: true }))
    )
);

gulp.task(
    "image:min",
    gulp.series("image:copy", () =>
        gulp
            .src([
                options.src.img,
                "!" + options.src.svg,
                "!**/*.svg",
                "!" + options.src.favicon,
                { base: arg.p + "src" },
            ])
            .pipe(imagemin(options.imagemin.images))
            .pipe(gulp.dest(options.dist.html))
    )
);

gulp.task("tinypng", async function () {
    gulp.src([options.src.img, "!" + options.src.favicon])
        .pipe(
            tinypng({
                key: "ccTD120tSFZHRwl6LhF7QS79rJFgrf4Z",
                sigFile: "images/.tinypng-sigs",
                log: true,
                summarize: true,
            })
        )
        .pipe(gulp.dest(options.dist.img));
});

//task for static copy
gulp.task("static:build", function () {
    return gulp
        .src([options.src.favicon, options.src.fonts, options.src.static], {
            base: arg.p + "src",
        })
        .pipe(gulp.dest(options.dist.html));
});

gulp.task("cleanup", function (cb) {
    return del([options.del, { force: true }], cb());
});

/*
  Tasks:
  * build (gulp build) -- start building task
  * production (gulp prod) -- minification files (now - only CSS)
  * watch (gulp static-watch)
*/

// watch task
gulp.task("fe-watch", function () {
    $.watch(options.watch.svg, gulp.series("icons:build"));
    $.watch(options.watch.html, gulp.series("html:build"));
    $.watch(options.watch.style, gulp.series("style:min"));
});

gulp.task("dev", function (cb) {
    return runSequence(["webserver", "build", "fe-watch"], cb);
});

gulp.task("build", function (cb) {
    return runSequence(
        "cleanup",
        "icons:build",
        "html:build",
        "style:min",
        //"js:build",
        //"image:copy",
        //"static:build",
        cb
    );
});

gulp.task("prod", function (cb) {
    return runSequence(
        "cleanup",
        "html:build",
        "js:build",
        "static:build",
        "style:min",
        "image:webp",
        "tinypng",
        cb
    );
});

// main default task
gulp.task("default", function (cb) {
    return runSequence("build", ["fe-watch"], cb);
});
