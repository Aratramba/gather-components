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

async function gatherComponents(componentsStore, htmlSources) {
  return Promise.all(htmlSources.map((html) => {
    const $ = cheerio.load(html);

    // loop over components
    componentsStore.map((component) => {

      if (component.selector && !component.selectors) {
        component.selectors = [component.selector];
      }

      if (!component.sources) {
        component.sources = [];
      }

      // no selectors, do nothing
      if (!component.selectors) {
        return;
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

    // validate input collection YAML
    if (!Array.isArray(componentsStore) || !componentsStore.every(item => (item !== null && typeof item === 'object'))) {
      return reject(new TypeError('Wrong YAML components format. Make sure top-level YAML is a collection with objects nested inside them.'));
    }

    // validate individual components YAML
    const componentsDict = {};
    componentsStore.forEach((component) => {

      // must have a name
      if (!component.name) {
        return reject(new TypeError(`Component must have a name field: ${JSON.stringify(component)}`));
      }

      // must have a selector or selectors
      if (!component.selector && !component.selectors) {
        return reject(new TypeError(`Component must have a selector field: ${JSON.stringify(component)}`));
      }

      // selector must be a string
      if (component.selector && typeof component.selector !== 'string') {
        return reject(new TypeError(`Component selector field must be a string: ${JSON.stringify(component)}`));
      }

      // selectors must be an array
      if (component.selectors && !Array.isArray(component.selectors)) {
        return reject(new TypeError(`Component selectors field must be a collection: ${JSON.stringify(component)}`));
      }

      // must not have duplicate names
      if (component.name in componentsDict) {
        return reject(new TypeError(`Duplicate component names found: ${component.name}`));
      }

      componentsDict[component.name] = component;
    });

    // scrape all html sources
    const htmlSources = await request(settings.url, settings.paths, settings.fetchOptions);

    // get components from html sources
    await gatherComponents(componentsStore, htmlSources);

    // build examples for every component
    await buildExamples(componentsStore);

    // generate output
    const output = componentsStore.map((component) => {
      return {
        meta: {
          name: component.name,
          description: component.description || '',
        },
        output: component.output.join('\n'),
      };
    });

    // write json
    if (settings.output) {
      writeJsonFile(settings.output, output).then(() => {
        return resolve(output);
      });

    // complete
    } else {
      return resolve(output);
    }
  });
}

module.exports = scraper;
