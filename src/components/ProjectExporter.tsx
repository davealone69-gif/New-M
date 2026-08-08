import React, { useState } from 'react';
import { FolderGit2, Download, Terminal, CheckCircle2, Copy, FileCode, Check, Cpu } from 'lucide-react';
import JSZip from 'jszip';
import { BuildArtifact } from '../types';
import { CodeViewer } from './CodeViewer';

interface ProjectExporterProps {
  artifacts: BuildArtifact[];
}

export const ProjectExporter: React.FC<ProjectExporterProps> = ({ artifacts }) => {
  const [activeFileTab, setActiveFileTab] = useState<'app_build' | 'settings' | 'manifest' | 'activity' | 'workflow' | 'git'>('app_build');
  const [isZipping, setIsZipping] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);

  const sampleCode = artifacts.length > 0 ? artifacts[0].generatedCode : `// Default Feature Component
package com.mandela.matrixos.feature

import androidx.compose.material3.*
import androidx.compose.runtime.*

@Composable
fun MainFeatureScreen() {
    Text("Mandela Matrix OS Feature Component")
}`;

  const rootBuildGradle = `// Root build.gradle.kts - Mandela Matrix OS
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.20" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.20" apply false
}`;

  const appBuildGradle = `// app/build.gradle.kts - Mandela Matrix OS
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("kotlin-kapt")
}

android {
    namespace = "com.mandela.matrixos"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mandela.matrixos"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "3.8-HYBRID"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")

    // Room Database - Local Persistence
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // Generative AI SDK & Networking
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}`;

  const settingsGradleContent = `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MandelaMatrixOS"
include(":app")
`;

  const gradleWrapperProperties = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

  const gradlewScript = `#!/usr/bin/env sh
# Mandela Matrix OS Canonical Gradle Wrapper Script
DIRNAME=$(dirname "$0")
if [ -z "$DIRNAME" ]; then DIRNAME="." ; fi

WRAPPER_JAR="$DIRNAME/gradle/wrapper/gradle-wrapper.jar"

if [ -f "$WRAPPER_JAR" ]; then
    exec java -classpath "$WRAPPER_JAR" org.gradle.wrapper.GradleWrapperMain "$@"
elif command -v gradle >/dev/null 2>&1; then
    exec gradle "$@"
else
    echo "Error: Neither Gradle wrapper jar nor gradle command found." >&2
    exit 1
fi
`;

  const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Mandela Matrix OS"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MandelaMatrixOS"
        tools:targetApi="35">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.MandelaMatrixOS">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`;

  const mainActivityContent = `package com.mandela.matrixos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFF00FF41),
                    background = Color(0xFF0D0208),
                    surface = Color(0xFF1A1A1A)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0D0208)
                ) {
                    Text(
                        text = "MANDELA MATRIX OS ONLINE - KOTLIN COMPOSE SDK 35",
                        color = Color(0xFF00FF41)
                    )
                }
            }
        }
    }
}`;

  const githubWorkflowContent = `name: Android Matrix CI/CD Build

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v5
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Setup Android SDK Tools
      uses: android-actions/setup-android@v3

    - name: Install Android API 35 Build-Tools
      run: |
        sdkmanager "platforms;android-35" "build-tools;35.0.0"

    - name: Ensure Gradle Wrapper JAR Exists
      run: |
        gradle wrapper --gradle-version 8.7
        chmod +x gradlew

    - name: Build Debug & Release APK Binaries
      run: ./gradlew assembleDebug assembleRelease --no-daemon

    - name: Verify APK Integrity & Print SHA-256 Hashes
      run: |
        echo "=== VERIFYING APK ARTIFACTS ==="
        find app/build/outputs/apk/ -name "*.apk" -exec ls -lh {} +
        find app/build/outputs/apk/ -name "*.apk" -exec sha256sum {} +

    - name: Upload Release APK Binary
      uses: actions/upload-artifact@v4
      with:
        name: MandelaMatrixOS-Release-APK
        path: app/build/outputs/apk/release/*.apk

    - name: Upload Debug APK Binary
      uses: actions/upload-artifact@v4
      with:
        name: MandelaMatrixOS-Debug-APK
        path: app/build/outputs/apk/debug/*.apk`;

  const gitCommands = `# 1. Initialize local Git repository
git init

# 2. Stage all generated Matrix OS files
git add .

# 3. Commit initial build
git commit -m "Initialize Mandela Matrix OS: Multi-Agent Swarm & Core Gemini AI"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub Repository URL
git remote add origin https://github.com/YOUR_USERNAME/MandelaMatrixOS.git

# 6. Push to GitHub
git push -u origin main`;

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Project Root Files
      zip.file('README.md', '# Mandela Matrix OS\n\nAndroid Workstation generated by AI Studio.');
      zip.file('AGENTS.md', '# System Directives\nZero-Mock Real Build Directives.');
      zip.file('.gitignore', 'build/\n.gradle/\nlocal.properties\n*.apk\n.idea/\n');
      zip.file('settings.gradle.kts', settingsGradleContent);
      zip.file('build.gradle.kts', rootBuildGradle);
      zip.file('gradlew', gradlewScript);
      zip.file('gradlew.bat', '@rem Gradle wrapper for Windows\ngradle %*\n');

      // Gradle Wrapper Folder
      const wrapperDir = zip.folder('gradle')?.folder('wrapper');
      wrapperDir?.file('gradle-wrapper.properties', gradleWrapperProperties);

      // GitHub Action Workflow
      const githubDir = zip.folder('.github')?.folder('workflows');
      githubDir?.file('android-build.yml', githubWorkflowContent);

      // App directory
      const appDir = zip.folder('app');
      appDir?.file('build.gradle.kts', appBuildGradle);

      const srcMain = appDir?.folder('src')?.folder('main');
      srcMain?.file('AndroidManifest.xml', manifestContent);

      const javaDir = srcMain?.folder('java')?.folder('com')?.folder('mandela')?.folder('matrixos');
      javaDir?.file('MainActivity.kt', mainActivityContent);

      // Add all artifacts into the zip
      const artifactsFolder = javaDir?.folder('features');
      artifacts.forEach((art, idx) => {
        const cleanName = art.taskName.replace(/[^a-zA-Z0-9]/g, '_') || `Feature_${idx}`;
        artifactsFolder?.file(`${cleanName}.kt`, art.generatedCode);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MandelaMatrixOS_AndroidProject.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP bundle:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyGit = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded border border-[#00FF41]/40 bg-black/80 shadow-[0_0_15px_rgba(0,255,65,0.15)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#00FF41]/10 border border-[#00FF41]">
              <FolderGit2 className="w-6 h-6 text-[#00FF41] animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#00FF41] tracking-wider">
                ANDROID GRADLE & GITHUB CI EXPORTER
              </h2>
              <p className="text-xs text-gray-400">
                1-Click Export Complete Android Studio Project (.ZIP) with CI/CD Workflow
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-[#00FF41] text-black font-bold text-xs hover:bg-[#008F11] hover:text-white transition shadow-[0_0_15px_#00FF41] cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'GENERATING ZIP...' : 'EXPORT ANDROID PROJECT (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Navigation File Tabs */}
      <div className="flex items-center gap-2 border-b border-[#00FF41]/30 pb-2 overflow-x-auto">
        {[
          { id: 'app_build', label: 'app/build.gradle.kts' },
          { id: 'settings', label: 'settings.gradle.kts' },
          { id: 'manifest', label: 'AndroidManifest.xml' },
          { id: 'activity', label: 'MainActivity.kt' },
          { id: 'workflow', label: '.github/workflows/android-build.yml' },
          { id: 'git', label: 'Git Push Commands' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFileTab(tab.id as any)}
            className={`px-3 py-1.5 rounded text-xs transition cursor-pointer font-bold border whitespace-nowrap ${
              activeFileTab === tab.id
                ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]'
                : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="p-4 rounded border border-[#00FF41]/30 bg-black/90">
        {activeFileTab === 'app_build' && (
          <CodeViewer code={appBuildGradle} filename="app/build.gradle.kts" language="kotlin" />
        )}
        {activeFileTab === 'settings' && (
          <CodeViewer code={settingsGradleContent} filename="settings.gradle.kts" language="kotlin" />
        )}
        {activeFileTab === 'manifest' && (
          <CodeViewer code={manifestContent} filename="AndroidManifest.xml" language="xml" />
        )}
        {activeFileTab === 'activity' && (
          <CodeViewer code={mainActivityContent} filename="MainActivity.kt" language="kotlin" />
        )}
        {activeFileTab === 'workflow' && (
          <CodeViewer code={githubWorkflowContent} filename="android-build.yml" language="yaml" />
        )}

        {activeFileTab === 'git' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#00FF41]/20 pb-2">
              <span className="font-bold text-[#00FF41] flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                GITHUB DEPLOYMENT TERMINAL COMMANDS
              </span>
              <button
                onClick={handleCopyGit}
                className="flex items-center gap-1 px-3 py-1 rounded bg-[#008F11]/20 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/20 transition cursor-pointer text-xs"
              >
                {copiedGit ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGit ? 'COPIED COMMANDS' : 'COPY ALL COMMANDS'}</span>
              </button>
            </div>

            <pre className="p-4 rounded bg-[#0D0208] border border-[#00FF41]/30 text-emerald-300 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto">
              {gitCommands}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
