import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
export type GeneratedFile = { path: string; content: string };
export type BuildResult = { id: string; status: 'success' | 'failed' | 'unavailable'; message: string; apkPath?: string; sha256?: string; logs: string };
const PACKAGE_NAME = 'com.mandela.generatedapp';
const SDK = 35;

function safeRelativeFile(filePath: string) {
  const normalized = filePath.replaceAll('\\', '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..') || normalized.startsWith('.git/') || normalized.startsWith('gradle/wrapper/')) throw new Error(`Rejected generated file path: ${filePath}`);
  const allowed = /^(app\/src\/main\/AndroidManifest\.xml$|app\/src\/main\/(java|res|assets)\/|app\/src\/test\/|app\/proguard-rules\.pro$|README\.md$)/;
  if (!allowed.test(normalized)) throw new Error(`Generated file is outside the allowed app source tree: ${filePath}`);
  return normalized;
}

function fixedProjectFiles(mainActivity: string): GeneratedFile[] {
  return [
    { path: 'settings.gradle.kts', content: `pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }\ndependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }\nrootProject.name = "GeneratedMatrixApp"\ninclude(":app")\n` },
    { path: 'build.gradle.kts', content: `plugins {\n    id("com.android.application") version "8.5.2" apply false\n    id("org.jetbrains.kotlin.android") version "2.0.20" apply false\n    id("org.jetbrains.kotlin.plugin.compose") version "2.0.20" apply false\n}\n` },
    { path: 'gradle.properties', content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\n` },
    { path: 'app/build.gradle.kts', content: `plugins { id("com.android.application"); id("org.jetbrains.kotlin.android"); id("org.jetbrains.kotlin.plugin.compose") }\nandroid { namespace = "${PACKAGE_NAME}"; compileSdk = ${SDK}; defaultConfig { applicationId = "${PACKAGE_NAME}"; minSdk = 26; targetSdk = ${SDK}; versionCode = 1; versionName = "1.0" }; buildTypes { release { isMinifyEnabled = false; signingConfig = signingConfigs.getByName("debug") } }; compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }; kotlinOptions { jvmTarget = "17" }; buildFeatures { compose = true } }\ndependencies { implementation(platform("androidx.compose:compose-bom:2024.10.01")); implementation("androidx.activity:activity-compose:1.9.3"); implementation("androidx.compose.ui:ui"); implementation("androidx.compose.ui:ui-tooling-preview"); implementation("androidx.compose.material3:material3") }\n` },
    { path: 'app/src/main/AndroidManifest.xml', content: `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application android:theme="@style/GeneratedTheme" android:label="Generated Matrix App" android:allowBackup="true" android:supportsRtl="true"><activity android:name=".MainActivity" android:exported="true"><intent-filter><action android:name="android.intent.action.MAIN" /><category android:name="android.intent.category.LAUNCHER" /></intent-filter></activity></application></manifest>\n` },
    { path: 'app/src/main/res/values/styles.xml', content: `<?xml version="1.0" encoding="utf-8"?><resources><style name="GeneratedTheme" parent="android:style/Theme.Material.NoActionBar" /></resources>\n` },
    { path: 'app/src/main/java/com/mandela/generatedapp/MainActivity.kt', content: mainActivity },
  ];
}

async function writeProject(root: string, files: GeneratedFile[]) {
  for (const file of files) { const relative = safeRelativeFile(file.path); const target = path.join(root, relative); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, file.content, 'utf8'); }
}
async function toolAvailable(command: string, args: string[] = ['--version']) { try { await execFileAsync(command, args, { timeout: 15000 }); return true; } catch { return false; } }
async function findGradle(root: string) { const wrapper = path.join(root, 'gradlew'); if (existsSync(wrapper)) return wrapper; if (await toolAvailable('gradle')) return 'gradle'; return null; }

export async function buildAndroidApp(generated: { mainActivity: string; extraFiles?: GeneratedFile[] }): Promise<BuildResult> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const base = process.env.MANDELA_BUILD_ROOT || path.join(os.homedir(), '.mandela-matrix-builds');
  await mkdir(base, { recursive: true });
  const root = await mkdtemp(path.join(base, `${id}-`));
  let logs = '';
  try {
    const java = await toolAvailable(process.env.JAVA_BIN || 'java');
    const sdk = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;
    if (!java) return { id, status: 'unavailable', message: 'Java runtime is unavailable. Install/configure Java 17 for the local builder.', logs };
    if (!sdk || !existsSync(sdk)) return { id, status: 'unavailable', message: 'Android SDK is unavailable. Set ANDROID_SDK_ROOT or ANDROID_HOME to an installed Android SDK.', logs };
    await writeProject(root, [...fixedProjectFiles(generated.mainActivity), ...(generated.extraFiles || [])]);
    const gradle = await findGradle(root);
    if (!gradle) return { id, status: 'unavailable', message: 'Gradle is unavailable. Install Gradle or provide a valid Gradle wrapper in the build environment.', logs };
    try {
      const result = await execFileAsync(gradle, ['--no-daemon', '--stacktrace', 'assembleDebug'], { cwd: root, env: { ...process.env, ANDROID_SDK_ROOT: sdk, ANDROID_HOME: sdk }, timeout: Number(process.env.MANDELA_BUILD_TIMEOUT_MS || 900000), maxBuffer: 20 * 1024 * 1024 });
      logs = `${result.stdout}\n${result.stderr}`.slice(-200000);
    } catch (error: any) {
      logs = `${error?.stdout || ''}\n${error?.stderr || ''}\n${error?.message || error}`.slice(-200000);
      return { id, status: 'failed', message: 'Android Gradle build failed.', logs };
    }
    const apkPath = path.join(root, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    if (!existsSync(apkPath)) return { id, status: 'failed', message: 'Gradle reported success but the expected APK was not produced.', logs };
    const apk = await readFile(apkPath);
    const sha256 = createHash('sha256').update(apk).digest('hex');
    const finalDir = path.join(base, 'artifacts', id);
    await mkdir(finalDir, { recursive: true });
    const finalApk = path.join(finalDir, 'app-debug.apk');
    await writeFile(finalApk, apk);
    return { id, status: 'success', message: 'Android APK built and verified on the configured local build engine.', apkPath: finalApk, sha256, logs };
  } finally { await rm(root, { recursive: true, force: true }).catch(() => undefined); }
}
