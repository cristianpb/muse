import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import config from 'sapper/config/rollup.js';
import pkg from './package.json';
import builtins from 'rollup-plugin-node-builtins';
import { sass as sv_sass } from 'svelte-preprocess-sass'
import sass from 'rollup-plugin-sass';
import postcss from 'postcss'

const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./src/**/*.svelte", "./src/**/*.html"],
  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
});

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) => (warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message)) || onwarn(warning);

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		plugins: [
			replace({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode),
        __VERSION__: process.env.npm_package_version,
        __MOPIDY_HOST__: dev && process.env.MOPIDY_HOST ? process.env.MOPIDY_HOST : '',
        __MOPIDY_PORT__: dev && process.env.MOPIDY_PORT ? process.env.MOPIDY_PORT : ''
      }),
      sass({
        includePaths: ['src/scss', 'node_modules'],
        output: 'static/global.css',
        processor: css => postcss(...(mode === "production" ? [purgecss] : []))
        .process(css)
        .then(result => result.css),
        options: {
          outputStyle: 'compressed',
          sourceMap: false,
        }
      }),
			svelte({
				dev,
        // Prepare scss
        preprocess: {
          style: sv_sass({
            includePaths: ['src/scss', 'node_modules']
          })
        },
				hydratable: true,
				emitCss: true
			}),
			resolve({
				browser: true,
				dedupe: ['svelte']
			}),
      builtins(),
			commonjs(),

			legacy && babel({
				extensions: ['.js', '.mjs', '.html', '.svelte'],
				runtimeHelpers: true,
				exclude: ['node_modules/@babel/**'],
				presets: [
					['@babel/preset-env', {
						targets: '> 0.25%, not dead'
					}]
				],
				plugins: [
					'@babel/plugin-syntax-dynamic-import',
					['@babel/plugin-transform-runtime', {
						useESModules: true
					}]
				]
			}),

			!dev && terser({
				module: true
			})
		],

		onwarn,
	},

	server: {
		input: config.server.input(),
		output: config.server.output(),
		plugins: [
			replace({
				'process.browser': false,
				'process.env.NODE_ENV': JSON.stringify(mode),
        __VERSION__: process.env.npm_package_version,
        __MOPIDY_HOST__: dev && process.env.MOPIDY_HOST ? process.env.MOPIDY_HOST : '',
        __MOPIDY_PORT__: dev && process.env.MOPIDY_PORT ? process.env.MOPIDY_PORT : ''
			}),
			svelte({
				generate: 'ssr',
				dev
			}),
			resolve({
				dedupe: ['svelte']
			}),
			commonjs()
		],
		external: Object.keys(pkg.dependencies).concat(
			require('module').builtinModules || Object.keys(process.binding('natives'))
		),

		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode),
        __VERSION__: process.env.npm_package_version,
        __MOPIDY_HOST__: dev && process.env.MOPIDY_HOST ? process.env.MOPIDY_HOST : '',
        __MOPIDY_PORT__: dev && process.env.MOPIDY_PORT ? process.env.MOPIDY_PORT : ''
			}),
			commonjs(),
			!dev && terser()
		],

		onwarn,
	}
};
