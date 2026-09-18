require('./build-llms-core.test.js');
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
  const composer = bundle['md/components/composer.md'].toString('utf8');
  assert.match(composer, /<Composer/);
  assert.match(composer, /onPress\(value: string\): void/);
  assert.doesNotMatch(composer, /@site|<LiveDemo|<ApiReference/);
  assert.match(
    bundle['llms.txt'].toString('utf8'),
    /\]\(md\/components\/composer.md\)/
  );
  assert.deepEqual(JSON.parse(bundle['md/api.json'].toString('utf8')), api);
  assert.match(bundle['llms-full.txt'].toString('utf8'), /MessageListProps/);
  assert.match(
    bundle['md/getting-started.md'].toString('utf8'),
    /ThemeProvider/
  );
  for (const name of Object.keys(api).filter(
    (value) => value !== 'ChatAction'
  )) {
    assert.ok(
      Object.values(bundle).some((value) =>
        value.toString('utf8').includes(api[name].trim())
      ),
      `${name} is documented`
    );
  }
});

test('unsupported MDX and mismatched API references fail without replacing artifacts', async () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'chat-llms-input-'));
  const write = (name, value) => {
    const file = path.join(temporary, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, value);
  };
  try {
    write(
      'package.json',
      JSON.stringify({ name: '@unif/fixture', version: '1.0.0' })
    );
    write(
      'src/index.tsx',
      "export type { TestProps } from './components/Test';"
    );
    write(
      'src/components/Test/types.ts',
      'export interface TestProps { value: string }'
    );
    write(
      'website/docusaurus.config.ts',
      "export default { title: 'Fixture' };"
    );
    write('website/static/llms.txt', 'previous');
    for (const [body, error] of [
      ['<UnknownContent>重要说明</UnknownContent>', /Unsupported MDX/],
      ['<ApiReference name="Other" />', /does not match/],
    ]) {
      write(
        'website/docs/test.mdx',
        '---\ntitle: Test\napi: Test\n---\n' + body
      );
      await assert.rejects(
        createBundle(path.join(temporary, 'website')),
        error
      );
      assert.equal(
        fs.readFileSync(
          path.join(temporary, 'website/static/llms.txt'),
          'utf8'
        ),
        'previous'
      );
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
