// build/build-svg.js

/**
 * This file builds the flag files into their own repo. This way the git diff
 * can keep track of whether they have changed, and if so then a release needs
 * to be done.
 */

const fs = require('fs');
const { resolve } = require('path');
const { safeLoad } = require('js-yaml');

const {
  getFlags,
  VERSION,
} = require('../../signal-flags-js/dist/signal-flags');

// Set some constants.
const inBase = resolve(__dirname, '..', 'flagsets');
const outBase = resolve(__dirname, '..', '..', 'signal-flag-images', 'images');

const ts = new Date().toISOString();

const generated = {
  date: `${ts.substring(0, 10)} `,
  link: 'https://github.com/signal-flags/signal-flags',
  version: VERSION,
  engine: `${process.release.name} ${process.version}`,
};

/* Deprecated.
const licenseFile = fs
  .readFileSync(resolve(__dirname, '..', 'templates', '010-LICENSE'))
  .toString('utf-8');
*/

// Now we can start - first get the flags.
const flags = getFlags();

// WARNING - recursively delete all entries in the target directory!
console.log(`Deleting ${outBase}`);
fs.rmdirSync(outBase, { recursive: true });

// Get all the build input files and build them.
fs.readdirSync(inBase).forEach((inFileName) => {
  // Check it is a .yaml file and strip the extension.
  if (!inFileName.substring(inFileName.length - 4) === '.yaml') {
    console.log(`Ignoring ${inFileName}`);
    return;
  }

  // Parse the input YAML and start writing.
  const outDirName = inFileName.substring(0, inFileName.length - 5);
  const outPath = resolve(outBase, outDirName);
  console.log(`Writing ${outPath}`);

  const inFile = fs.readFileSync(resolve(inBase, inFileName)).toString('utf-8');
  const build = safeLoad(inFile);

  fs.mkdirSync(outPath, { recursive: true });
  const { options, description, license } = build;

  // Write files for each flag.
  Object.entries(flags.getSvg(null, { ...options, file: true })).forEach(
    ([key, outFile]) => {
      try {
        flags.checkSvg(outFile, { file: true });
      } catch (e) {
        console.log('Error in SVG file for', key, e);
      }

      const outFileName = `${key}.svg`;
      fs.writeFileSync(resolve(outPath, outFileName), outFile);
    }
  );

  // Write the JSON file for all flags.
  let json = {
    meta: {
      description,
      license,
      generated,
    },
    svg: flags.getSvg(null, options),
  };

  // Write the JSON file.
  let outFile = JSON.stringify(json, null, 2) + '\n';
  fs.writeFileSync(resolve(outPath, `100-svg.json`), outFile);

  // Write a JS file for web users.
  outFile = `SvgLoad.add(${outFile})`;
  fs.writeFileSync(resolve(outPath, `110-svg.js`), outFile);

  const header = [
    '---',
    '# This file describes a set of signal flag images.',
    '# See https://github.com/signal-flags/signal-flag-images.',
    '',
  ].join('\n');

  const insert = [
    'generated:',
    `  date: ${generated.date}`,
    `  link: ${generated.link}`,
    `  version: ${generated.version}`,
    `  engine: ${generated.engine}`,
    '',
    'options:',
  ].join('\n');

  // Re-write the README file.
  outFile = inFile.replace('---', header).replace('options:', insert);
  fs.writeFileSync(resolve(outPath, '000-README.yaml'), outFile);

  // Decided to do without this, there is the spdx in the README.
  // Copy over the LICENSE file.
  // fs.writeFileSync(resolve(outPath, '010-LICENSE'), licenseFile);
});
