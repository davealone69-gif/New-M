package com.mandela.matrixos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MandelaMatrixOSApp()
        }
    }
}

@Composable
fun MandelaMatrixOSApp() {
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
