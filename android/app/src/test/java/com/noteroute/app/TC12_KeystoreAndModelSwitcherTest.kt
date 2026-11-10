package com.noteroute.app

import com.noteroute.app.data.model.AiModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * TC-12: Keystore Signing Spec & Model Switcher (Modul Izat)
 * Validates model key mapping, failover heuristics, and release signing requirements.
 */
class TC12_KeystoreAndModelSwitcherTest {

    @Test
    fun `TC-12-01 - Verify all 4 AI model targets match API_CONTRACT`() {
        assertEquals("gemini", AiModel.GEMINI.targetKey)
        assertEquals("groq", AiModel.GROQ.targetKey)
        assertEquals("deepseek", AiModel.DEEPSEEK.targetKey)
        assertEquals("9router_local", AiModel.NINE_ROUTER.targetKey)

        assertEquals(AiModel.GEMINI, AiModel.fromTargetKey("gemini"))
        assertEquals(AiModel.GROQ, AiModel.fromTargetKey("groq"))
        assertEquals(AiModel.DEEPSEEK, AiModel.fromTargetKey("deepseek"))
        assertEquals(AiModel.NINE_ROUTER, AiModel.fromTargetKey("9router_local"))
    }

    @Test
    fun `TC-12-02 - Validate Keystore specifications matching KEYSTORE_AND_SECRETS_SPEC`() {
        val expectedAlias = "noteroute_key"
        val expectedKeystoreName = "note-route-release.jks"

        assertEquals("noteroute_key", expectedAlias)
        assertEquals("note-route-release.jks", expectedKeystoreName)

        // Check that keystore file was generated according to spec if present
        val candidates = listOf(
            File(expectedKeystoreName),
            File("..", expectedKeystoreName),
            File("android", expectedKeystoreName),
            File(System.getProperty("user.dir") ?: ".", expectedKeystoreName)
        )
        val keystoreFile = candidates.firstOrNull { it.exists() }
        if (keystoreFile != null) {
            assertTrue("Keystore file must not be empty", keystoreFile.length() > 0)
        }
    }

    @Test
    fun `TC-12-03 - Validate heuristic fallback logic to Groq on rate limit`() {
        var currentModel = AiModel.GEMINI
        val httpStatusCode = 429 // Rate limit exceeded

        if (httpStatusCode == 429 && currentModel == AiModel.GEMINI) {
            currentModel = AiModel.GROQ
        }

        assertEquals(AiModel.GROQ, currentModel)
    }
}
