const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const writeJsonFile = require('write-json-file');
const YAML = require('js-yaml');
const cheerio = require('cheerio');


/**
 * Request
 */

async function request(url, paths, fetchOptions) {
  return Promise.all(paths.map(async (path) => {
    const response = await fetch(url + path, fetchOptions);
    return response.text();
  }));
}


/**
 * Gather components
 */

async function gatherComponents(componentsStore, htmlArray) {
  return Promise.all(htmlArray.map((html) => {
    const $ = cheerio.load(html);

    // loop over components
    componentsStore.map((component) => {

      if (component.selector && !component.selectors) {
        component.selectors = [component.selector];
      }

      if (!component.sources) {
        component.sources = [];
      }

      // loop over selectors
      component.selectors.forEach((selector) => {
        $(selector).each((i, $el) => {
          component.sources.push($.html($el));
        });
      });
    });
  }));
}


/**
 * Build examples
 */

async function buildExamples(componentsStore) {
  return Promise.all(componentsStore.map(async (component) => {
    let examples = [];
    if (component.example) {
      examples = examples.concat(component.example);
    }
    if (component.examples) {
      examples = examples.concat(component.examples);
    }
    
    component.examples = examples;
    component.output = [];

    // loop over all dom elements and examples
    // to generate output
    component.sources.forEach((src) => {
      if (!component.examples.length) {
        component.output.push(src);
      } else {
        component.examples.forEach((example) => {
          component.output.push(example.replace(new RegExp(/{{block}}/g), src));
        });
      }
    });
  }));
}


/**
 * Main
 */

function scraper(options) {
  return new Promise(async (resolve, reject) => {
    if (typeof options === 'undefined') {
      return reject(new TypeError('settings object is required'));
    }

    if (typeof options.url === 'undefined') {
      return reject(new TypeError('settings.url is required'));
    }

    if (typeof options.url !== 'string') {
      return reject(new TypeError('settings.url must be a string'));
    }

    if (typeof options.paths === 'undefined') {
      return reject(new TypeError('settings.paths is required'));
    }

    if (!Array.isArray(options.paths)) {
      return reject(new TypeError('settings.paths must be an array'));
    }

    if (typeof options.components === 'undefined') {
      return reject(new TypeError('settings.components is required'));
    }

    if (typeof options.components !== 'string') {
      return reject(new TypeError('settings.components must be a string'));
    }

    const settings = Object.assign({
      fetchOptions: {},
    }, options);

    // check YAML file existance
    settings.components = path.resolve(options.components);
    if (!fs.existsSync(settings.components)) {
      return reject(new TypeError(`${options.components} does not exist`));
    }

    let componentsStore = {};

    // read YAML
    try {
      componentsStore = YAML.safeLoad(fs.readFileSync(settings.components, 'utf8'));
    } catch (e) {
      return reject(new Error(e));
    }

    // const pages = await fetch(options.url, options.paths);
    const htmlArray = await request(settings.url, settings.paths, settings.fetchOptions);
    await gatherComponents(componentsStore, htmlArray);
    await buildExamples(componentsStore);

    const output = componentsStore.map((component) => {
      return {
        meta: {
          name: component.name,
          description: component.description,
        },
        output: component.output.join('\n'),
      };
    });

    if (settings.output) {
      writeJsonFile(settings.output, output).then(() => {
        return resolve(output);
      });
    } else {
      return resolve(output);
    }
  });
}


const settings = {
  url: 'https://rawgit.com/EightMedia/gather-components/master/test/fixtures/',
  paths: ['test.html', 'test2.html'],
  components: 'test/fixtures/components.yaml',
  output: 'components.json'
};
scraper(settings).then((output) => {
  console.log(output);
}).catch((err) => {
  console.log(err);
});

module.exports = scraper;
