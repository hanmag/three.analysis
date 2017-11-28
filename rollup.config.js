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
        babel({ exclude: 'node_modules/**' })
    ],
    banner: `// Version ${version} ${name} - ${homepage}`
};