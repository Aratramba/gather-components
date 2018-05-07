const test = require('ava');
const rimraf = require('rimraf');
const scraper = require('../index');
const path = require('path');
const fs = require('fs');

const outputFixture = JSON.parse(fs.readFileSync('test/fixtures/components.json', 'utf-8'));

const settings = {
  url: 'https://rawgit.com/EightMedia/gather-components/master/test/fixtures/',
  paths: ['test.html', 'test2.html'],
  components: 'test/fixtures/components.yaml',
  output: 'test/tmp/components.json',
};

test('write output', async (t) => {
  rimraf.sync(path.resolve(settings.output));
  return scraper(settings).then((output) => {
    t.deepEqual(JSON.parse(fs.readFileSync(path.resolve(settings.output), 'utf-8')), outputFixture);
  });
});

test('log output', async (t) => {
  rimraf.sync(path.resolve(settings.output));

  return scraper(settings).then((output) => {
    t.deepEqual(output, outputFixture);
  });
});
