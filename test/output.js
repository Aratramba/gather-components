const test = require('ava');
const scraper = require('../index');

const settings = {
  url: 'https://rawgit.com/EightMedia/gather-components/master/test/fixtures/',
  paths: ['test.html', 'test2.html'],
  components: 'test/fixtures/components.yaml',
  output: 'components.json',
};

test('output', async (t) => {
  return scraper(settings).then((output) => {
    t.is(Array.isArray(output), true);
    t.is(output.length, 2);
  });
});
