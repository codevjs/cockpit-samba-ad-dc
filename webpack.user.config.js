const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fs = require("fs");
const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');

var externals = {
    cockpit: "cockpit",
};

/* These can be overridden, typically from the Makefile.am */
const srcdir = (process.env.SRCDIR || __dirname) + path.sep + "src";
const builddir = (process.env.SRCDIR || __dirname);
const distdir = builddir + path.sep + "dist";
const nodedir = path.resolve((process.env.SRCDIR || __dirname), "node_modules");

/* A standard nodejs and webpack pattern */
var production = process.env.NODE_ENV === 'production';

var info = {
    entries: {
        "user/index": [
            "./user/index.js"
        ],
    },
    files: [
        "user/user.html",
        "manifest.json",
    ],
};

var output = {
    path: distdir,
    filename: "[name].js",
    sourceMapFilename: "[file].map",
};

/*
 * Note that we're avoiding the use of path.join as webpack and nodejs
 * want relative paths that start with ./ explicitly.
 *
 * In addition we mimic the VPATH style functionality of GNU Makefile
 * where we first check builddir, and then srcdir.
 */

function vpath(/* ... */) {
    var filename = Array.prototype.join.call(arguments, path.sep);
    var expanded = builddir + path.sep + filename;
    if (fs.existsSync(expanded))
        return expanded;
    expanded = srcdir + path.sep + filename;
    return expanded;
}

/* Qualify all the paths in entries */
Object.keys(info.entries).forEach(function(key) {
    info.entries[key] = info.entries[key].map(function(value) {
        if (value.indexOf("/") === -1)
            return value;
        else
            return vpath(value);
    });
});

/* Qualify all the paths in files listed */
var files = [];
info.files.forEach(function(value) {
    files.push({ from: vpath(value), to: value });
});
info.files = files;

var plugins = [
    new CopyWebpackPlugin({
        patterns: info.files
    }),
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new ESLintPlugin({
        extensions: ['js', 'jsx', 'ts', 'tsx']
    })
];

/* Only minimize when in production mode */
if (production) {
    /* Rename output files when minimizing */
    output.filename = "[name].min.js";

    plugins.unshift(new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.(js|html)$/,
        minRatio: 0.9
    }));
}

var babel_loader = {
    loader: "babel-loader",
    options: {
        presets: [
            ["@babel/env", {
                targets: {
                    chrome: "57",
                    firefox: "52",
                    safari: "10.3",
                    edge: "16",
                    opera: "44"
                }
            }],
            "@babel/preset-react"
        ]
    }
};

module.exports = {
    mode: production ? 'production' : 'development',
    resolve: {
        modules: [ nodedir, srcdir ],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
            "@": path.resolve(__dirname, "src"),
            "tslib": path.resolve(__dirname, "node_modules/tslib/tslib.es6.js"),
        }
    },
    entry: info.entries,
    externals: externals,
    output: output,
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: babel_loader,
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader'
                ]
            },
        ]
    },
    plugins: plugins
};
