package com.noteroute.app.ui.studio

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.noteroute.app.databinding.FragmentStudioBinding

class StudioFragment : Fragment() {

    private var _binding: FragmentStudioBinding? = null
    private val binding get() = _binding!!

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
            generateArtifact("Audio Overview", "Menghasilkan podcast AI 2-host dari dokumen...")
        }
        binding.cardStudioVideo.setOnClickListener {
            generateArtifact("Video Overview", "Menghasilkan ringkasan visual video materi...")
        }
        binding.cardStudioSlide.setOnClickListener {
            generateArtifact("Slide Deck", "Menyusun kerangka slide presentasi...")
        }
        binding.cardStudioFlashcards.setOnClickListener {
            generateArtifact("Flashcards", "Membuat 10 kartu tanya-jawab hafalan...")
        }
        binding.cardStudioQuiz.setOnClickListener {
            generateArtifact("Quiz", "Membuat kuis latihan ujian 5 soal pilihan ganda...")
        }
        binding.cardStudioInfographic.setOnClickListener {
            generateArtifact("Infographic", "Menyusun skema arsitektur visual sistem...")
        }
        binding.cardStudioReports.setOnClickListener {
            generateArtifact("Reports & Executive Summary", "Membuat ringkasan eksekutif komprehensif...")
        }
    }

    private fun generateArtifact(title: String, message: String) {
        Toast.makeText(requireContext(), "[$title] $message", Toast.LENGTH_SHORT).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun newInstance() = StudioFragment()
    }
}
