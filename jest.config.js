const designPreset = require('@unif/react-native-design/jest-preset');

module.exports = {
  ...designPreset,
  // 库开发不依赖预先构建 lib，示例仍从同一个真实公共入口消费。
  moduleNameMapper: {
    ...designPreset.moduleNameMapper,
    '^@unif/react-native-chat$': '<rootDir>/src/index.tsx',
  },
  // Markdown 的真实解析器及计数样式发布 ESM，沿用 Design preset 并补其依赖。
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@unif|@callstack/liquid-glass|marked|github-slugger|@jsamr|react-native-(gesture-handler|reanimated|worklets|safe-area-context|svg|reanimated-carousel))/)',
  ],
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
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'example/src/**/*.{ts,tsx}',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: { statements: 100, branches: 100, functions: 100, lines: 100 },
  },
  watchman: false,
};
