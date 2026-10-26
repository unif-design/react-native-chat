# Example native host verification

Run `yarn test:native` from the repository root. The runner remains in `scripts/test-native-hosts.py`; example-only assertions and boundary doubles live in `example/android/__tests__` and `example/ios/__tests__`.

`yarn test:native` compiles and instruments the original two Android host Kotlin sources and the original iOS AppDelegate and SceneDelegate Swift sources. It retains the production `@main`, replacing only UIKit's application event loop. No implementation is extracted or copied into the harness.

Requirements: macOS/Xcode, the example's Kotlin compiler dependencies in the Gradle cache, JDK 17+, and JaCoCo 0.8.13 agent/CLI jars. Set `JAVA_HOME` and `JACOCO_HOME` when these are not in their default locations.

Android assertions verify superclass startup, RN initialization, lazy host identity, package autolinking, matching JavaScript module name and both Fabric flag values. iOS assertions verify launch defaults, invalid/valid scenes, dependency/factory/window identity, development controls, both scene link callbacks, Metro URL/nil behavior, and real Foundation resource lookup with absent/present Release bundles. Debug and Release are compiled separately.

Reports and exact source hashes are saved in `coverage/native-hosts`. Every source in the declared host inventory must be present; any emitted coverage counter below 100% fails. Kotlin emits no conditional branch counters for this template. Swift emits no branch counters here, so branches are N/A rather than claimed 100%; the corresponding input paths are explicitly asserted.

These are owned-host wiring checks with external Android/UIKit/RN boundary doubles. They do not prove a full Android/iOS application build, platform rendering, or device behavior. Library JS/TS coverage and website consumption remain separate reports.
