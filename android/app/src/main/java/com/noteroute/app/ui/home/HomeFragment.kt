package com.noteroute.app.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.noteroute.app.data.api.ApiClient
import com.noteroute.app.data.model.WorkspaceItem
import com.noteroute.app.databinding.FragmentHomeBinding
import com.noteroute.app.ui.components.ProfileBottomSheet
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private lateinit var notebookAdapter: NotebookAdapter
    var onNotebookSelectedListener: ((WorkspaceItem) -> Unit)? = null
    var onCreateNewNotebookListener: (() -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupListeners()
        loadNotebooks()
    }

    private fun setupRecyclerView() {
        notebookAdapter = NotebookAdapter { notebook ->
            onNotebookSelectedListener?.invoke(notebook)
        }

        binding.rvNotebooks.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = notebookAdapter
        }
    }

    private fun setupListeners() {
        binding.btnCreateNewNotebook.setOnClickListener {
            onCreateNewNotebookListener?.invoke()
        }

        binding.btnProfileAvatar.setOnClickListener {
            val sheet = ProfileBottomSheet.newInstance()
            sheet.show(parentFragmentManager, ProfileBottomSheet.TAG)
        }

        binding.btnHomeSearch.setOnClickListener {
            Toast.makeText(requireContext(), "Cari notebook kuliah & riset...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadNotebooks() {
        // Default notebooks matching mockup
        val defaultList = listOf(
            WorkspaceItem(
                id = "6727bd89f1a23b0012e84101",
                name = "Materi Kuliah Semester 5 • Sistem Terdistribusi",
                description = "Slide kuliah, modul praktikum, dan riset",
                documentCount = 4,
                createdAt = "2026-11-04T08:00:00.000Z"
            ),
            WorkspaceItem(
                id = "6727bd89f1a23b0012e84102",
                name = "Catatan Riset Multi-LLM & Failover",
                description = "Perbandingan latensi Gemini dan Groq",
                documentCount = 2,
                createdAt = "2026-11-05T09:00:00.000Z"
            )
        )

        notebookAdapter.submitList(defaultList)

        // Asynchronously fetch from server if available
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = ApiClient.apiService.getWorkspaces()
                if (response.success && !response.data.isNullOrEmpty()) {
                    withContext(Dispatchers.Main) {
                        notebookAdapter.submitList(response.data)
                    }
                }
            } catch (e: Exception) {
                // Keep default list
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun newInstance() = HomeFragment()
    }
}
