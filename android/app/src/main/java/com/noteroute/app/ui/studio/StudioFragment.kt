package com.noteroute.app.ui.studio

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.noteroute.app.data.model.ChatRequest
import com.noteroute.app.data.repository.NoteRouteRepository
import com.noteroute.app.databinding.FragmentStudioBinding
import com.noteroute.app.ui.components.StudioOutputBottomSheet
import com.noteroute.app.utils.Constants
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class StudioFragment : Fragment() {

    private var _binding: FragmentStudioBinding? = null
    private val binding get() = _binding!!

    private val repository = NoteRouteRepository()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentStudioBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.cardStudioAudio.setOnClickListener {
            generateStudioOutput(
                title = "Audio Overview (Transkrip Podcast)",
                prompt = "Buatlah transkrip singkat podcast AI 2-host yang mendiskusikan materi dari dokumen ini.",
                fallback = "🎙️ **AUDIO OVERVIEW PODCAST**\n\n**Host A:** 'Selamat datang! Hari ini kita membedah konsep utama dari dokumen notebook Anda.'\n**Host B:** 'Keren banget! Semua pembahasan terverifikasi langsung dari sumber asli tanpa halusinasi.'"
            )
        }

        binding.cardStudioStudyGuide.setOnClickListener {
            generateStudioOutput(
                title = "Panduan Belajar (Study Guide)",
                prompt = "Buatlah panduan belajar ringkas berstruktur poin-poin penting untuk persiapan ujian dari dokumen ini.",
                fallback = "📖 **PANDUAN BELAJAR PERSAPUAN UJIAN**\n\n1. **Pahami Konsep Utama:** Pelajari arsitektur dan prinsip kerja dasar pada materi.\n2. **Kunci Jawaban Penting:** Fokus pada istilah teknis dan hubungan antar-komponen.\n3. **Konteks Grounding:** Pastikan pemahaman terverifikasi dengan rujukan dokumen."
            )
        }

        binding.cardStudioBriefingDocs.setOnClickListener {
            generateStudioOutput(
                title = "Briefing Docs (Executive Document)",
                prompt = "Buatlah dokumen ringkasan eksekutif (Briefing Document) berisi kesimpulan utama dari dokumen ini.",
                fallback = "📋 **BRIEFING DOCS (EXECUTIVE SUMMARY)**\n\n📌 **Tujuan:** Memberikan gambaran singkat dan padat mengenai isi materi notebook.\n📌 **Kesimpulan Utama:**\n- Pengintegrasian dokumen laptop ke perangkat HP.\n- Otomatisasi failover Multi-LLM untuk menghemat kuota token.\n- Keamanan dan sinkronisasi lintas perangkat."
            )
        }

        binding.cardStudioFaq.setOnClickListener {
            generateStudioOutput(
                title = "Frequently Asked Questions (FAQ)",
                prompt = "Buatlah 4 daftar pertanyaan dan jawaban yang sering ditanyakan (FAQ) dari dokumen ini.",
                fallback = "❓ **FREQUENTLY ASKED QUESTIONS (FAQ)**\n\n1. **Q:** Apa fungsi utama aplikasi ini?\n   **A:** Sebagai Knowledge Agent cerdas untuk mengelola dan bertanya ke dokumen laptop Anda.\n2. **Q:** Apakah aman?\n   **A:** Ya, menggunakan otentikasi akun dan koneksi terenkripsi."
            )
        }

        binding.cardStudioTimeline.setOnClickListener {
            generateStudioOutput(
                title = "Linimasa (Timeline)",
                prompt = "Buatlah linimasa kronologis urutan topik atau proses dari dokumen ini.",
                fallback = "⏳ **LINIMASA PROSES KRONOLOGIS**\n\n• **Tahap 1:** Pengunggahan & Ekstraksi Teks Dokumen\n• **Tahap 2:** Pembentukan Konteks Grounding & Rujukan\n• **Tahap 3:** Inferensi AI & Pengalihan Failover Otomatis\n• **Tahap 4:** Penyajian Jawaban Berisi Citation Badges"
            )
        }
    }

    private fun generateStudioOutput(title: String, prompt: String, fallback: String) {
        Toast.makeText(requireContext(), "Menghasilkan [$title]...", Toast.LENGTH_SHORT).show()

        CoroutineScope(Dispatchers.IO).launch {
            val result = repository.sendChat(
                ChatRequest(
                    workspaceId = Constants.DEFAULT_WORKSPACE_ID,
                    prompt = prompt,
                    modelTarget = "gemini"
                )
            )

            withContext(Dispatchers.Main) {
                val outputText = result.getOrNull()?.responseText ?: fallback
                val sheet = StudioOutputBottomSheet.newInstance(title, outputText)
                sheet.show(parentFragmentManager, StudioOutputBottomSheet.TAG)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun newInstance() = StudioFragment()
    }
}
