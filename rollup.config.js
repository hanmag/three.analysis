import postCss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { name, homepage, version } from './package.json';

export default {
    input: 'src/index.js',
    output: [
        {
            format: 'umd',
            name: 'ThreeAnalysis',
            file: `dist/${name}.js`,
            sourcemap: true
        }
    ],
    plugins: [
        postCss(),
        resolve(),
        commonJs(),
        babel({ exclude: 'node_modules/**' })
    ],
    banner: `// Version ${version} ${name} - ${homepage}`
};