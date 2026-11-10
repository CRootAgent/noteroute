package com.noteroute.app

import com.google.gson.Gson
import com.noteroute.app.data.model.CitationItem
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

/**
 * TC-10: Citation Badges & Reference Inspector (Modul Izat)
 * Validates extraction of citation references, page numbers, and snippet verification.
 */
class TC10_CitationBadgesTest {

    private val gson = Gson()

    private val citationJson = """
    {
      "doc_id": "6727be01f1a23b0012e84102",
      "filename": "Slide_Bab3_Distributed_Systems.pdf",
      "page": 14,
      "snippet": "Teorema CAP membuktikan ketidakmungkinan mencapai konsistensi kuat secara bersamaan dengan ketersediaan penuh pada partisi jaringan."
    }
    """.trimIndent()

    @Test
    fun `TC-10-01 - Parse citation item and map page number correctly`() {
        val citation = gson.fromJson(citationJson, CitationItem::class.java)

        assertNotNull(citation)
        assertEquals("6727be01f1a23b0012e84102", citation.docId)
        assertEquals("Slide_Bab3_Distributed_Systems.pdf", citation.filename)
        assertEquals(14, citation.page)
        assertEquals(
            "Teorema CAP membuktikan ketidakmungkinan mencapai konsistensi kuat secara bersamaan dengan ketersediaan penuh pada partisi jaringan.",
            citation.snippet
        )
    }

    @Test
    fun `TC-10-02 - Format citation badge label for mobile UI`() {
        val citation = TestDataFactory.createSampleChatResponse().citations.first()
        val badgeLabel = "${citation.filename} : Hal ${citation.page}"

        assertEquals("Slide_Bab3_Distributed_Systems.pdf : Hal 14", badgeLabel)
    }
}
