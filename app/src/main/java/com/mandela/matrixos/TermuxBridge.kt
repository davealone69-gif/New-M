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
            val intent = Intent("com.termux.RUN_COMMAND").apply {
                setClassName("com.termux", "com.termux.app.RunCommandService")
                putExtra("com.termux.RUN_COMMAND_PATH", "/data/data/com.termux/files/usr/bin/bash")
                putExtra(
                    "com.termux.RUN_COMMAND_ARGUMENTS",
                    arrayOf(
                        "-lc",
                        "set -e; cd \"${'$'}HOME\"; if [ ! -d New-M ]; then git clone https://github.com/davealone69-gif/New-M.git; fi; cd ~/New-M; npm install --no-audit --no-fund; nohup npm run dev > ~/.mandela-matrix.log 2>&1 &"
                    )
                )
                putExtra("com.termux.RUN_COMMAND_BACKGROUND", true)
            }
            context.startService(intent)
            true
        } catch (_: Exception) {
            false
        }
    }
}
