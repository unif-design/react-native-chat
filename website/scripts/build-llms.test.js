const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
const { createBundle } = require('./build-llms');
const { readPublicApi } = require('./public-api');

const root = path.join(__dirname, '../..');
test('API documents include actual public declarations and exclude private layout types', () => {
  const api = readPublicApi(root);
  assert.match(api.Composer, /onPress\(value: string\): void/);
  assert.match(api.Attachments, /interface AttachmentsProps/);
  assert.doesNotMatch(api.Attachments, /interface AttachmentItemProps/);
  assert.doesNotMatch(api.MessageList, /interface ListMeasurements/);
  assert.equal(Object.keys(api).length, 12);
});
test('generated documentation retains usage, real API and deployable links', async () => {
  const { bundle, api } = await createBundle(path.join(root, 'website'));
  const composer = bundle['md/components/composer.md'];
  assert.match(composer, /<Composer/);
  assert.match(composer, /onPress\(value: string\): void/);
  assert.doesNotMatch(composer, /@site|<LiveDemo|<ApiReference/);
  assert.match(
    bundle['llms.txt'],
    /https:\/\/unif-design.github.io\/react-native-chat\/md\/components\/composer.md/
  );
  assert.match(bundle['llms-full.txt'], /MessageListProps/);
  assert.match(bundle['md/getting-started.md'], /ThemeProvider/);
  for (const name of Object.keys(api).filter(
    (value) => value !== 'ChatAction'
  )) {
    assert.ok(
      Object.values(bundle).some((value) => value.includes(api[name].trim())),
      `${name} is documented`
    );
  }
});
