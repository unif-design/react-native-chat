'use strict';
const path = require('node:path');
const webpack = require('webpack');

module.exports = function reactNativeWebPlugin(context) {
  const projectRoot = path.resolve(context.siteDir, '..');
  const sources = [
    path.join(projectRoot, 'src'),
    path.join(projectRoot, 'example/src'),
  ];
  const runtimePackages = [
    'react',
    'react-dom',
    '@unif/react-native-design',
    'react-native-gesture-handler',
    'react-native-reanimated',
    'react-native-worklets',
    'react-native-safe-area-context',
    'react-native-svg',
  ];
  const runtimeAliases = Object.fromEntries(
    runtimePackages.map((name) => [
      name,
      path.dirname(
        require.resolve(`${name}/package.json`, { paths: [projectRoot] })
      ),
    ])
  );
  const rnPackages =
    /node_modules\/(react-native-(?:marked|reanimated(?:-carousel|-table)?|worklets|gesture-handler|svg|safe-area-context|web)|@jsamr\/react-native-li|@sbaiahmed1\/react-native-blur)\//;
  const animationFrame = path.join(__dirname, 'shims/AnimationFrame.js');
  return {
    name: 'docusaurus-rnw',
    configureWebpack(_config, isServer) {
      return {
        plugins: [
          new webpack.DefinePlugin({
            '__DEV__': JSON.stringify(
              !isServer && process.env.NODE_ENV !== 'production'
            ),
            'process.env.JEST_WORKER_ID': JSON.stringify(undefined),
          }),
          new webpack.ProvidePlugin({
            requestAnimationFrame: [animationFrame, 'requestAnimationFrame'],
            cancelAnimationFrame: [animationFrame, 'cancelAnimationFrame'],
          }),
        ],
        mergeStrategy: {
          'module.rules': 'prepend',
          'resolve.extensions': 'prepend',
        },
        resolve: {
          alias: {
            ...runtimeAliases,
            'react-native$': 'react-native-web',
            'react-native/Libraries': false,
            'react-native/src': false,
            '@unif/react-native-chat$': path.join(projectRoot, 'src/index.tsx'),
          },
          extensions: [
            '.web.tsx',
            '.web.ts',
            '.web.jsx',
            '.web.js',
            '.tsx',
            '.ts',
            '.jsx',
            '.js',
            '.json',
          ],
        },
        module: {
          rules: [
            {
              test: /\.(tsx|ts|jsx|mjs|js)$/,
              include: [...sources, rnPackages],
              use: {
                loader: require.resolve('babel-loader'),
                options: {
                  babelrc: false,
                  configFile: false,
                  cacheDirectory: true,
                  presets: [
                    [
                      require.resolve('@babel/preset-env'),
                      { targets: 'defaults', loose: true },
                    ],
                    [
                      require.resolve('@babel/preset-react'),
                      { runtime: 'automatic' },
                    ],
                    require.resolve('@babel/preset-typescript'),
                    [require.resolve('@babel/preset-flow'), { all: true }],
                  ],
                  plugins: [require.resolve('react-native-worklets/plugin')],
                },
              },
            },
            {
              test: /\.(png|jpe?g|gif|webp)$/,
              include: sources,
              type: 'asset/resource',
            },
            {
              test: /\.m?js$/,
              include: /node_modules/,
              resolve: { fullySpecified: false },
            },
          ],
        },
      };
    },
  };
};
