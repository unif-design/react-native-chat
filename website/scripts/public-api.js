const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function readPublicApi(root) {
  const parse = (file) =>
    ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true
    );
  const entry = parse(path.join(root, 'src/index.tsx'));
  const exportsByModule = new Map();
  for (const node of entry.statements) {
    if (
      !ts.isExportDeclaration(node) ||
      !node.isTypeOnly ||
      !node.exportClause ||
      !ts.isNamedExports(node.exportClause)
    )
      continue;
    const modulePath = node.moduleSpecifier.text;
    const names = exportsByModule.get(modulePath) || new Set();
    for (const item of node.exportClause.elements)
      names.add(item.propertyName?.text || item.name.text);
    exportsByModule.set(modulePath, names);
  }
  const result = {};
  for (const [modulePath, names] of exportsByModule) {
    const source = parse(path.join(root, 'src', modulePath, 'types.ts'));
    const declarations = source.statements.filter(
      (node) =>
        ts.isImportDeclaration(node) || (node.name && names.has(node.name.text))
    );
    for (const name of names) {
      if (!declarations.some((node) => node.name?.text === name))
        throw new Error(`Missing public type ${name}`);
    }
    const name =
      modulePath === './actions' ? 'ChatAction' : path.basename(modulePath);
    result[name] =
      declarations
        .map((node) => node.getText(source))
        .join('\n\n')
        .replace(
          /from '\.\.\/\.\.\/actions'/g,
          "from '@unif/react-native-chat'"
        ) + '\n';
  }
  return result;
}
module.exports = { readPublicApi };
