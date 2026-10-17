"""Instrument original example host sources against Android/UIKit/RN boundaries.

These checks cover owned host wiring, not platform or React Native internals.
Native app compilation and device acceptance remain separate integration gates.
"""

import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

from native.coverage_tools import jacoco_tools

ROOT = Path(__file__).resolve().parent.parent
TESTS = ROOT / "scripts/native-host-tests"
OUTPUT = ROOT / "coverage/native-hosts"
MODULE = json.loads((ROOT / "example/app.json").read_text())["name"]


def run(*arguments, **kwargs):
    return subprocess.run(list(map(str, arguments)), check=True, **kwargs)


def ios(build):
    modules = ["UIKit", "React", "React_RCTAppDelegate", "ReactAppDependencyProvider"]
    common = ["xcrun", "swiftc", "-swift-version", "5", "-I", build, "-L", build,
              "-module-cache-path", build / "swift-cache"]
    linked = []
    for module in modules:
        run(*common, "-emit-library", "-emit-module", "-module-name", module,
            "-emit-module-path", build / (module + ".swiftmodule"),
            TESTS / "ios" / (module + ".swift"), *linked,
            "-Xlinker", "-undefined", "-Xlinker", "dynamic_lookup",
            "-o", build / ("lib" + module + ".dylib"))
        linked.append("-l" + module)
    harness = build / "NativeHostTests.swift"
    harness.write_text((TESTS / "ios/NativeHostTests.swift.in").read_text().replace("__MODULE__", MODULE))
    sources = sorted((ROOT / "example/ios" / MODULE).glob("*.swift"))
    reports = []
    for variant, flags in [("debug", ["-D", "DEBUG"]), ("release", [])]:
        name = "ios-" + variant
        executable = build / name
        run(*common, "-profile-generate", "-profile-coverage-mapping", *flags,
            "-module-name", "NativeHostTests", *sources, harness, *linked,
            "-Xlinker", "-rpath", "-Xlinker", build, "-o", executable)
        profiles = []
        for bundle in (["absent"] if variant == "debug" else ["absent", "present"]):
            fixture = build / "main.jsbundle"
            if bundle == "present":
                fixture.write_text("// packaged example fixture\n")
            profile = build / (name + "-" + bundle + ".profraw")
            run(executable, env=dict(os.environ, LLVM_PROFILE_FILE=str(profile), EXPECT_BUNDLE=bundle), timeout=15)
            profiles.append(profile)
            if fixture.exists():
                fixture.unlink()
        merged = OUTPUT / (name + ".profdata")
        run("xcrun", "llvm-profdata", "merge", "-sparse", *profiles, "-o", merged)
        arguments = [executable, "-instr-profile=" + str(merged), *sources]
        exported = run("xcrun", "llvm-cov", "export", *arguments, capture_output=True, text=True)
        data = json.loads(exported.stdout)["data"][0]
        (OUTPUT / (name + ".json")).write_text(exported.stdout)
        run("xcrun", "llvm-cov", "report", *arguments)
        run("xcrun", "llvm-cov", "show", *arguments, "-format=html",
            "-output-dir=" + str(OUTPUT / name))
        measured = {Path(file["filename"]) for file in data["files"]}
        if measured != set(sources):
            raise RuntimeError("Incomplete owned Swift source inventory")
        for file in data["files"]:
            for metric in ("lines", "functions", "regions", "branches"):
                count = file["summary"][metric]
                if count["covered"] != count["count"]:
                    raise RuntimeError("Native Swift coverage below 100%: " + file["filename"] + " " + metric)
        reports.append({"variant": name, "totals": data["totals"]})
    return sources, reports


def android(build):
    cache = Path(os.environ.get("GRADLE_USER_HOME", str(Path.home() / ".gradle"))) / "caches/modules-2/files-2.1"

    def cached(pattern):
        files = sorted(cache.glob(pattern))
        if not files:
            raise RuntimeError("Missing cached compiler dependency: " + pattern)
        return files[-1]

    def dependencies(module):
        document = ET.parse(cached(module + "/*/*.pom"))
        ns = {"m": "http://maven.apache.org/POM/4.0.0"}
        return ["/".join(dep.findtext("m:" + field, namespaces=ns) for field in ("groupId", "artifactId", "version"))
                for dep in document.findall("m:dependencies/m:dependency", ns)]

    version = re.search(r'kotlinVersion\s*=\s*"([^"]+)"', (ROOT / "example/android/build.gradle").read_text()).group(1)
    compiler = "org.jetbrains.kotlin/kotlin-compiler-embeddable/" + version
    stdlib = "org.jetbrains.kotlin/kotlin-stdlib/" + version
    cp = [cached(module + "/*/*.jar") for module in dict.fromkeys([compiler, *dependencies(compiler), *dependencies(stdlib)])]
    stdlib_jar = cached(stdlib + "/*/*.jar")
    java = Path(os.environ["JAVA_HOME"]) / "bin/java" if "JAVA_HOME" in os.environ else Path(shutil.which("java"))
    sources = sorted((ROOT / "example/android/app/src/main").rglob("*.kt"))
    package = re.search(r"^package ([\w.]+)", sources[0].read_text()).group(1)
    harness = build / "NativeHostTests.kt"
    harness.write_text((TESTS / "android/NativeHostTests.kt.in").read_text().replace("__PACKAGE__", package).replace("__MODULE__", MODULE))
    classes = build / "classes"
    classes.mkdir()
    run(java.with_name("javac"), "-d", classes, *sorted((TESTS / "android/java").rglob("*.java")))
    run(java, "-cp", os.pathsep.join(map(str, cp)), "org.jetbrains.kotlin.cli.jvm.K2JVMCompiler",
        "-nowarn", "-no-stdlib", "-no-reflect", "-classpath", os.pathsep.join(map(str, [stdlib_jar, classes])),
        "-d", classes, *sources, *sorted((TESTS / "android").glob("*.kt")), harness)
    agent, cli = jacoco_tools(ROOT)
    execution = OUTPUT / "android.exec"
    run(java, "-javaagent:" + str(agent) + "=destfile=" + str(execution) + ",append=false",
        "-cp", os.pathsep.join(map(str, [classes, stdlib_jar])), "NativeHostTestsKt")
    owned = classes / package.replace(".", "/")
    run(java, "-jar", cli, "report", execution, "--classfiles", owned,
        "--sourcefiles", ROOT / "example/android/app/src/main/java",
        "--xml", OUTPUT / "android.xml", "--html", OUTPUT / "android")
    report = ET.parse(OUTPUT / "android.xml").getroot()
    if {file.get("name") for file in report.findall(".//sourcefile")} != {source.name for source in sources}:
        raise RuntimeError("Incomplete owned Kotlin source inventory")
    counters = {count.get("type"): {"covered": int(count.get("covered")), "missed": int(count.get("missed"))}
                for count in report.findall("counter")}
    if any(count["missed"] for count in counters.values()):
        raise RuntimeError("Native Kotlin host coverage below 100%: " + str(counters))
    print("Android host counters:", counters)
    return sources, [{"variant": "android", "totals": counters}]


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    owned_directories = [ROOT / "example/android/app/src/main", ROOT / "example/ios" / MODULE]
    inventory = sorted(path for directory in owned_directories for path in directory.rglob("*") if path.suffix in (".kt", ".java", ".m", ".mm", ".swift"))
    before = {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in inventory}
    with tempfile.TemporaryDirectory(prefix="unif-native-host-") as directory:
        build = Path(directory)
        android_sources, android_reports = android(build)
        ios_sources, ios_reports = ios(build)
    sources = android_sources + ios_sources
    if set(sources) != set(inventory):
        raise RuntimeError("Some owned example native implementation was not instrumented")
    if any(hashlib.sha256(path.read_bytes()).hexdigest() != before[path] for path in sources):
        raise RuntimeError("An owned native source changed during coverage collection")
    manifest = {
        "sources": {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in sources},
        "reports": android_reports + ios_reports,
        "swiftBranches": "N/A: this Swift compiler does not emit branch counters. Invalid/valid scenes and Debug/Release bundle paths are exercised.",
        "boundaries": "Real original example host sources. Android, UIKit and React Native are external boundary doubles. Native app builds and device behavior are separate gates.",
    }
    (OUTPUT / "scope.json").write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    main()
