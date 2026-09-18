const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { readPublicApi } = require('./public-api');

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
  const config = fs.readFileSync(
    path.join(root, 'docusaurus.config.ts'),
    'utf8'
  );
  const url = config.match(/\burl:\s*'([^']+)'/)?.[1];
  const baseUrl = config.match(/\bbaseUrl:\s*'([^']+)'/)?.[1];
  const title = config.match(/\btitle:\s*'([^']+)'/)?.[1];
  if (!url || !baseUrl || !title)
    throw new Error('Missing site URL, baseUrl or title');
  const site = new URL(baseUrl, url);
  const docsDir = path.join(root, 'docs');
  const files = fs
    .readdirSync(docsDir, { recursive: true })
    .filter((file) => /\.mdx?$/.test(file))
    .sort();
  const pages = files.map((file) => {
    const { data, content } = matter(
      fs.readFileSync(path.join(docsDir, file), 'utf8')
    );
    const slug = (data.slug || file.replace(/\.mdx?$/, '')).replace(/^\//, '');
    if (
      !data.title ||
      !/^[a-z0-9/-]+$/i.test(slug) ||
      slug.split('/').includes('..')
    )
      throw new Error(`Invalid documentation route: ${file}`);
    return {
      file,
      data,
      content,
      slug,
      url: new URL(`docs/${slug}`, site).href,
    };
  });
  if (new Set(pages.map((page) => page.slug)).size !== pages.length)
    throw new Error('Duplicate documentation route');
  const routes = new Map(pages.map((page) => [page.file, page.url]));
  const bundle = {};
  const index = [
    `# ${title}`,
    '',
    '> 独立、可组合的 React Native 聊天组件。',
    '',
    '## 文档',
    '',
  ];
  const full = [`# ${title}`, ''];
  for (const page of pages) {
    const tree = parser.parse(page.content);
    const clean = (node) => {
      if (
        node.type === 'link' &&
        node.url &&
        !/^(?:[a-z]+:|#)/i.test(node.url)
      ) {
        const [pathname, hash] = node.url.split('#');
        const target = path.posix.normalize(
          path.posix.join(path.posix.dirname(page.file), pathname)
        );
        const linked =
          routes.get(target) ||
          routes.get(`${target}.mdx`) ||
          routes.get(`${target}.md`);
        node.url = linked
          ? linked + (hash ? `#${hash}` : '')
          : new URL(node.url, page.url).href;
      }
      if (node.children)
        node.children = node.children
          .filter((child) => !child.type.startsWith('mdx'))
          .map(clean);
      return node;
    };
    let markdown = `# ${page.data.title}\n\n来源：${page.url}\n\n${printer.stringify(clean(tree))}`;
    if (page.data.api) {
      if (!api[page.data.api]) throw new Error(`Missing API ${page.data.api}`);
      markdown += `\n## 公开类型\n\n\`\`\`ts\n${api[page.data.api]}\`\`\`\n`;
    }
    bundle[`md/${page.slug}.md`] = markdown;
    index.push(
      `- [${page.data.title}](${new URL(`md/${page.slug}.md`, site).href})${page.data.description ? ` — ${page.data.description}` : ''}`
    );
    full.push(markdown);
  }
  bundle['llms.txt'] = index.join('\n') + '\n';
  bundle['llms-full.txt'] = full.join('\n---\n\n');
  return { bundle, api };
}

async function build(root) {
  const { bundle, api } = await createBundle(root);
  const output = path.join(root, 'static');
  fs.rmSync(path.join(output, 'md'), { recursive: true, force: true });
  for (const [file, content] of Object.entries(bundle)) {
    const target = path.join(output, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  const generated = path.join(root, 'src/generated');
  fs.mkdirSync(generated, { recursive: true });
  fs.writeFileSync(
    path.join(generated, 'api.json'),
    JSON.stringify(api, null, 2) + '\n'
  );
  process.stdout.write(
    `Generated ${Object.keys(bundle).length - 2} documentation pages and public API text.\n`
  );
}
if (require.main === module) {
  build(path.join(__dirname, '..')).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
module.exports = { createBundle };
