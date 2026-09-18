'use strict';
const path = require('node:path');
const matter = require('gray-matter');
const { readPublicApi } = require('./public-api');
const { buildBundle, commitBundle } = require('./llms/bundle');

async function createBundle(root) {
  const [
    { unified },
    { default: parse },
    { default: mdx },
    { default: stringify },
  ] = await Promise.all([
    import('unified'),
    import('remark-parse'),
    import('remark-mdx'),
    import('remark-stringify'),
  ]);
  const parser = unified().use(parse).use(mdx);
  const printer = unified().use(stringify, { fences: true });
  const api = readPublicApi(path.dirname(root));
  const bundle = buildBundle({
    root,
    publicApi: api,
    renderDocument(document) {
      const { data } = matter(document.raw);
      const tree = parser.parse(document.body);
      function clean(node) {
        if (!node.children) return node;
        node.children = node.children
          .filter((child) => {
            if (child.type === 'mdxjsEsm' && /^import\s/.test(child.value))
              return false;
            if (!child.type.startsWith('mdx')) return true;
            if (
              ['LiveDemo', 'ComponentCatalog', 'ApiReference'].includes(
                child.name
              )
            ) {
              if (child.name === 'ApiReference') {
                const name = child.attributes.find(
                  (attribute) => attribute.name === 'name'
                )?.value;
                if (name !== data.api)
                  throw new Error(
                    `${document.sourceName}: API reference does not match page metadata`
                  );
              }
              return false;
            }
            throw new Error(
              `${document.sourceName}: Unsupported MDX content ${child.name || child.type}`
            );
          })
          .map(clean);
        return node;
      }
      let markdown = printer.stringify(clean(tree));
      if (!/^# /m.test(markdown))
        markdown = `# ${document.title}\n\n${markdown}`;
      if (data.api) {
        if (!api[data.api]) throw new Error(`Missing API ${data.api}`);
        markdown += `\n## 公开类型\n\n\`\`\`ts\n${api[data.api]}\`\`\`\n`;
      }
      return markdown;
    },
  });
  return { bundle, api };
}

async function build(root) {
  const { bundle } = await createBundle(root);
  commitBundle(path.join(root, 'static'), bundle);
  const count = Object.keys(bundle).filter((file) =>
    /^md\/.+\.md$/.test(file)
  ).length;
  process.stdout.write(
    `Generated ${count} documentation pages and public API text.\n`
  );
}
if (require.main === module)
  build(path.join(__dirname, '..')).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
module.exports = { createBundle };
