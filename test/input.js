const test = require('ava');
const scraper = require('../index');

const settings = {
  url: 'https://rawgit.com/EightMedia/gather-components/master/test/fixtures/',
  paths: ['test.html']
};

test('name required', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/no-name.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('Component must have a name field').length, 1);
});

test('selector required', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/no-selector.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('Component must have a selector field').length, 1);
});

test('selector string', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/invalid-selector.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('Component selector field must be a string').length, 1);
});

test('selectors array', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/invalid-selectors.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('Component selectors field must be a collection').length, 1);
});

test('no array of objects', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/no-array.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('Wrong YAML components format.').length, 1);
});

test('duplicate names', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/duplicate-names.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('Duplicate component names found: foo').length, 1);
});

test('blacklist array', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/invalid-blacklist.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('Component blacklist field must be a collection').length, 1);
});

test('whitelist array', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/invalid-whitelist.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('Component whitelist field must be a collection').length, 1);
});

test('whitelist and blacklist', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/whitelist-blacklist.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('Component whitelist and blacklist fields can not be used at the same time').length, 1);
});