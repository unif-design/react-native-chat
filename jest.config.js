const designPreset = require('@unif/react-native-design/jest-preset');

module.exports = {
  ...designPreset,
  // 库开发不依赖预先构建 lib，示例仍从同一个真实公共入口消费。
  moduleNameMapper: {
    ...designPreset.moduleNameMapper,
    '^@unif/react-native-chat$': '<rootDir>/src/index.tsx',
  },
  // Markdown 的真实解析器及计数样式发布 ESM，沿用 Design preset 并补其依赖。
  transformIgnorePatterns: designPreset.transformIgnorePatterns.map((pattern) =>
    pattern.replace(
      '@unif/react-native-design',
      '@unif/react-native-design|marked|github-slugger|@jsamr'
    )
  ),
  testEnvironmentOptions: {
    customExportConditions: [
      'require',
      'react-native',
      'unif-react-native-chat-source',
    ],
  },
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
    '<rootDir>/website/',
  ],
  watchman: false,
};
