package com.mandela.matrixos

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.webkit.JavascriptInterface

class TermuxBridge(private val context: Context) {
    @JavascriptInterface
    fun isInstalled(): Boolean = try {
        context.packageManager.getPackageInfo("com.termux", PackageManager.GET_ACTIVITIES)
        true
    } catch (_: Exception) {
        false
    }

    @JavascriptInterface
    fun startBackend(): Boolean {
        if (!isInstalled()) return false
        return try {
            val command = """
                set -u
                export ANDROID_SDK_ROOT=\"${'$'}HOME/android-sdk\"
                export ANDROID_HOME=\"${'$'}HOME/android-sdk\"
                cd \"${'$'}HOME\"
                if [ ! -d New-M/.git ]; then
                  rm -rf New-M
                  git clone https://github.com/davealone69-gif/New-M.git New-M
                else
                  cd New-M
                  git pull --ff-only origin main || true
                  cd ..
                fi
                cd \"${'$'}HOME/New-M\"
                command -v node >/dev/null 2>&1 || exit 20
                command -v npm >/dev/null 2>&1 || exit 21
                if [ ! -d node_modules ]; then npm install --no-audit --no-fund || exit 22; fi
                pkill -f 'tsx server.ts' 2>/dev/null || true
                nohup npm run dev > \"${'$'}HOME/.mandela-matrix.log\" 2>&1 < /dev/null &
                echo ${'$'}! > \"${'$'}HOME/.mandela-matrix.pid\"
            """.trimIndent()

            val intent = Intent("com.termux.RUN_COMMAND").apply {
                setClassName("com.termux", "com.termux.app.RunCommandService")
                putExtra("com.termux.RUN_COMMAND_PATH", "/data/data/com.termux/files/usr/bin/bash")
                putExtra("com.termux.RUN_COMMAND_ARGUMENTS", arrayOf("-lc", command))
                putExtra("com.termux.RUN_COMMAND_BACKGROUND", true)
            }
            context.startService(intent)
            true
        } catch (_: Exception) {
            false
        }
    }
}
