import {rollup} from 'rollup';
import {terser} from 'rollup-plugin-terser';

const inputOptions = {
    input: 'src/meatwagon.js',
};
const outputOptionsList = [{
    file: 'dist/meatwagon.browser.min.js',
    format: 'iife',
    name: 'meatwagon',
    plugins: [terser()]
}, {
    file: 'dist/meatwagon.browser.js',
    format: 'iife',
    name: 'meatwagon',
}, {
    file: 'dist/meatwagon.esm.js',
    format: 'esm'
}];

async function generateOutputs(bundle) {
    for (const outputOptions of outputOptionsList) {
        await bundle.write(outputOptions);
    }
}

async function build() {
    let bundle;
    let buildFailed = false;
    try {
        bundle = await rollup(inputOptions);
        await generateOutputs(bundle);
    } catch (error) {
        buildFailed = true;
        console.error(error);
    }
    if (bundle) {
        await bundle.close();
    }
    process.exit(buildFailed ? 1 : 0);
}

build();