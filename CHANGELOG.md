# Changelog

## [3.6.1](https://github.com/unif-design/react-native-chat/compare/v3.6.0...v3.6.1) (2026-10-10)

### Bug Fixes

* **composer:** reduce plain compact vertical spacing ([#23](https://github.com/unif-design/react-native-chat/issues/23)) ([e8e593b](https://github.com/unif-design/react-native-chat/commit/e8e593b2eb78cff75c7ba25d4d43f7cfd75982f7))

# [3.6.0](https://github.com/unif-design/react-native-chat/compare/v3.5.1...v3.6.0) (2026-10-10)

### Features

* **composer:** add rounded attachment preview layout ([#22](https://github.com/unif-design/react-native-chat/issues/22)) ([2580862](https://github.com/unif-design/react-native-chat/commit/2580862b3c15b34770801d05e9aaa420127708cd))

## [3.5.1](https://github.com/unif-design/react-native-chat/compare/v3.5.0...v3.5.1) (2026-10-08)

### Bug Fixes

* **message:** contain markdown block spacing within body ([#20](https://github.com/unif-design/react-native-chat/issues/20)) ([ef36636](https://github.com/unif-design/react-native-chat/commit/ef36636d00e0c9e3b67f75ee56c114720e7002d7))

# [3.5.0](https://github.com/unif-design/react-native-chat/compare/v3.4.0...v3.5.0) (2026-10-08)

### Features

* **message:** expose composable waiting content ([#19](https://github.com/unif-design/react-native-chat/issues/19)) ([22f45fd](https://github.com/unif-design/react-native-chat/commit/22f45fd2e85797ad33a808bea8d3dba0880c990f))

# [3.4.0](https://github.com/unif-design/react-native-chat/compare/v3.3.1...v3.4.0) (2026-10-08)

### Features

* share composer actions through Design popover ([#18](https://github.com/unif-design/react-native-chat/issues/18)) ([a29b1c4](https://github.com/unif-design/react-native-chat/commit/a29b1c45d10f50f5ac26b358b78e136f674dcfc5))

## [3.3.1](https://github.com/unif-design/react-native-chat/compare/v3.3.0...v3.3.1) (2026-10-07)

### Bug Fixes

* separate attachment hit regions and align content spacing ([#17](https://github.com/unif-design/react-native-chat/issues/17)) ([aec4f0f](https://github.com/unif-design/react-native-chat/commit/aec4f0f1571fc3cb4a9e43e9df98c292dc33b2d7))

# [3.3.0](https://github.com/unif-design/react-native-chat/compare/v3.2.4...v3.3.0) (2026-10-07)

### Features

* align chat presentation and add explicit message anchoring ([#16](https://github.com/unif-design/react-native-chat/issues/16)) ([62a2627](https://github.com/unif-design/react-native-chat/commit/62a2627250ab30318997e3147f05aa1c089228e5))

## [3.2.4](https://github.com/unif-design/react-native-chat/compare/v3.2.3...v3.2.4) (2026-10-07)

### Bug Fixes

* show visible status labels in compact processes ([#15](https://github.com/unif-design/react-native-chat/issues/15)) ([076acec](https://github.com/unif-design/react-native-chat/commit/076acecb8f2e7b50f374613d6305c76531e28f2d))

## [3.2.3](https://github.com/unif-design/react-native-chat/compare/v3.2.2...v3.2.3) (2026-10-07)

### Bug Fixes

* avoid native scroll anchors for empty message lists ([#14](https://github.com/unif-design/react-native-chat/issues/14)) ([b619992](https://github.com/unif-design/react-native-chat/commit/b6199929d504a94b9eb76ec1a165daed1ee37b64))

## [3.2.2](https://github.com/unif-design/react-native-chat/compare/v3.2.1...v3.2.2) (2026-10-07)

### Bug Fixes

* **attachments:** preserve preview contracts and compact media layouts ([#13](https://github.com/unif-design/react-native-chat/issues/13)) ([c4d7dff](https://github.com/unif-design/react-native-chat/commit/c4d7dff3e12cf232f244167d614194c19a5be32d))

## [3.2.1](https://github.com/unif-design/react-native-chat/compare/v3.2.0...v3.2.1) (2026-10-06)

### Bug Fixes

* **process:** preserve compact action touch targets ([#12](https://github.com/unif-design/react-native-chat/issues/12)) ([5295d2a](https://github.com/unif-design/react-native-chat/commit/5295d2aae1866e80052f65a0837721c7308ea71a))

# [3.2.0](https://github.com/unif-design/react-native-chat/compare/v3.1.0...v3.2.0) (2026-10-06)

### Features

* **process:** add compact public progress display ([#11](https://github.com/unif-design/react-native-chat/issues/11)) ([e2b9333](https://github.com/unif-design/react-native-chat/commit/e2b9333095f4aaed1317e7542155c7383373c14f))

# [3.1.0](https://github.com/unif-design/react-native-chat/compare/v3.0.0...v3.1.0) (2026-10-06)

### Features

* **chat:** restore reference message and composer presentation ([#10](https://github.com/unif-design/react-native-chat/issues/10)) ([43c3d6e](https://github.com/unif-design/react-native-chat/commit/43c3d6ecb0bcf4dce524f50b7ad13bb6d2b48735))

# [3.0.0](https://github.com/unif-design/react-native-chat/compare/v2.2.0...v3.0.0) (2026-10-06)

* feat!: adopt Design 0.35 glass foundation (#9) ([10edde6](https://github.com/unif-design/react-native-chat/commit/10edde68171c6f0a22233228d1c23659ffefdab1)), closes [#9](https://github.com/unif-design/react-native-chat/issues/9)

### BREAKING CHANGES

* Chat now requires @unif/react-native-design ^0.35.0.
  Hosts must replace Design's previous blur peer with @callstack/liquid-glass
  and reinstall iOS Pods.

# [2.2.0](https://github.com/unif-design/react-native-chat/compare/v2.1.2...v2.2.0) (2026-10-03)

### Features

* add compact progress display and simplify attachments ([6cd87f6](https://github.com/unif-design/react-native-chat/commit/6cd87f6c735e298d612181b2d01f88e6dbe78bea))

## [2.1.2](https://github.com/unif-design/react-native-chat/compare/v2.1.1...v2.1.2) (2026-10-03)

### Bug Fixes

* **chat:** restore markdown images and stabilize message list updates ([5868c15](https://github.com/unif-design/react-native-chat/commit/5868c15999fd4c1ae4368db72f3953791222f2c9))

## [2.1.1](https://github.com/unif-design/react-native-chat/compare/v2.1.0...v2.1.1) (2026-09-20)

### Bug Fixes

* **composer:** 展开时保持原生输入层级稳定 ([#6](https://github.com/unif-design/react-native-chat/issues/6)) ([ddef28e](https://github.com/unif-design/react-native-chat/commit/ddef28e81bf5b85163bfe0d828b2460a65a12583))

# [2.1.0](https://github.com/unif-design/react-native-chat/compare/v2.0.0...v2.1.0) (2026-09-20)

### Features

* **chat:** 对齐输入区与快捷建议布局 ([#5](https://github.com/unif-design/react-native-chat/issues/5)) ([ec81034](https://github.com/unif-design/react-native-chat/commit/ec810349d3d216d6d9110fc2854210012d8109b4))

# 2.0.0 (2026-09-18)

### Bug Fixes

* resolve hoisted Android example dependencies ([89eac66](https://github.com/unif-design/react-native-chat/commit/89eac66f54545d4718f8b5db79feefcc570aafaf))

### Features

* implement independent chat components ([feac60f](https://github.com/unif-design/react-native-chat/commit/feac60f99bd8234a096f47f833d889a9f8098540))
