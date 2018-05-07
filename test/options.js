const test = require('ava');
const scraper = require('../index');

const settings = {
  url: 'https://rawgit.com/EightMedia/gather-components/master/test/fixtures/',
  paths: ['test.html', 'test2.html'],
  components: 'test/fixtures/components.yaml'
};

test('settings object required', async (t) => {
  const error = await t.throws(scraper());
  t.is(error.message, 'settings object is required');
});

test('url required', async (t) => {
  const options = Object.assign({}, settings);
  delete options.url;
  const error = await t.throws(scraper(options));
  t.is(error.message, 'settings.url is required');
});

test('url string', async (t) => {
  const options = Object.assign({}, settings);
  options.url = [];
  const error = await t.throws(scraper(options));
  t.is(error.message, 'settings.url must be a string');
});

test('paths required', async (t) => {
  const options = Object.assign({}, settings);
  delete options.paths;
  const error = await t.throws(scraper(options));
  t.is(error.message, 'settings.paths is required');
});

test('paths array', async (t) => {
  const options = Object.assign({}, settings);
  options.paths = {};
  const error = await t.throws(scraper(options));
  t.is(error.message, 'settings.paths must be an array');
});

test('components required', async (t) => {
  const options = Object.assign({}, settings);
  delete options.components;
  const error = await t.throws(scraper(options));
  t.is(error.message, 'settings.components is required');
});

test('components string', async (t) => {
  const options = Object.assign({}, settings);
  options.components = {};
  const error = await t.throws(scraper(options));
  t.is(error.message, 'settings.components must be a string');
});

test('yaml exists', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'foo.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('foo.yaml does not exist').length, 1);
});

test('yaml parser', async (t) => {
  const options = Object.assign({}, settings);
  options.components = 'test/fixtures/error.yaml';
  const error = await t.throws(scraper(options));
  t.is(error.message.match('YAMLException').length, 1);
});