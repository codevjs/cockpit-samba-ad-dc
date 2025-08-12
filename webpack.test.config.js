const path = require("path");
const fs = require("fs");
const ESLintPlugin = require('eslint-webpack-plugin');

/* These can be overridden, typically from the Makefile.am */
const srcdir = (process.env.SRCDIR || __dirname) + path.sep + "src";
const builddir = (process.env.SRCDIR || __dirname);
const distdir = builddir + path.sep + "dist";
const nodedir = path.resolve((process.env.SRCDIR || __dirname), "node_modules");

/* A standard nodejs and webpack pattern */
var production = process.env.NODE_ENV === 'production';

module.exports = {
    mode: production ? 'production' : 'development',
    resolve: {
        modules: [ nodedir ],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    entry: {
        "test": srcdir + "/test.ts"
    },
    output: {
        path: distdir,
        filename: "[name].js",
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
        ]
    },
    plugins: [
        new ESLintPlugin({
            extensions: ['ts']
        })
    ]
};
