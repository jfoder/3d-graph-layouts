import resolve from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import {terser} from "rollup-plugin-terser";
import dts from 'rollup-plugin-dts';
import {name, homepage, version, dependencies, peerDependencies} from './package.json';

const umdConf = {
    format: 'umd',
    name: 'ThreeForceGraph',
    globals: {three: 'THREE'},
    banner: `// Version ${version} ${name} - ${homepage}`
};

export default [
    {
        external: ['three'],
        input: 'src/index.js',
        output: [
            {
                ...umdConf,
                file: `example/basic/${name}.js`,
                sourcemap: true,
            },
            {
                ...umdConf,
                file: `example/timestamp/${name}.js`,
                sourcemap: true,
            },
            {
                ...umdConf,
                file: `example/tree_layout/${name}.js`,
                sourcemap: true,
            },
            {
                ...umdConf,
                file: `example/sphere/${name}.js`,
                sourcemap: true,
            },
            { // minify
                ...umdConf,
                file: `example/basic/${name}.js`,
                // plugins: [terser({
                //   output: { comments: '/Version/' }
                // })]
            }
        ],
        plugins: [
            resolve(),
            commonJs(),
            babel({exclude: 'node_modules/**'})
        ]
    },
    { // commonJs and ES modules
        input: 'src/index.js',
        output: [
            {
                format: 'cjs',
                file: `example/basic/${name}.common.js`,
                exports: 'auto'
            },
            {
                format: 'es',
                file: `example/basic/${name}.module.js`
            },
            {
                format: 'cjs',
                file: `example/timestamp/${name}.common.js`,
                exports: 'auto'
            },
            {
                format: 'es',
                file: `example/timestamp/${name}.module.js`
            },
            {
                format: 'cjs',
                file: `example/sphere/${name}.common.js`,
                exports: 'auto'
            },
            {
                format: 'es',
                file: `example/sphere/${name}.module.js`
            },
            {
                format: 'cjs',
                file: `example/tree_layout/${name}.common.js`,
                exports: 'auto'
            },
            {
                format: 'es',
                file: `example/tree_layout/${name}.module.js`
            }
        ],
        external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
        plugins: [
            babel()
        ]
    },
    { // expose TS declarations
        input: 'src/index.d.ts',
        output: [
            {
                file: `example/basic/${name}.d.ts`,
                format: 'es'
            },
            {
                file: `example/timestamp/${name}.d.ts`,
                format: 'es'
            },
            {
                file: `example/sphere/${name}.d.ts`,
                format: 'es'
            },
            {
                file: `example/tree_layout/${name}.d.ts`,
                format: 'es'
            }],
        plugins: [dts()]
    }
];