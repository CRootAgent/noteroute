package com.noteroute.app.ui.explorer

import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.noteroute.app.databinding.FragmentExplorerBinding
import com.noteroute.app.ui.components.DocumentPreviewBottomSheet
import kotlinx.coroutines.launch

class ExplorerFragment : Fragment() {

    private var _binding: FragmentExplorerBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ExplorerViewModel by viewModels()
    private lateinit var documentAdapter: DocumentAdapter

    private var currentSortOrder: Int = 0 // 0: Nama, 1: Ukuran, 2: Tanggal

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            Toast.makeText(requireContext(), "Mengunggah berkas dari HP...", Toast.LENGTH_SHORT).show()
            viewModel.uploadDocument(requireContext(), it)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentExplorerBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupListeners()
        observeViewModel()
    }

    private fun setupRecyclerView() {
        documentAdapter = DocumentAdapter(
            onPreviewClick = { doc ->
                val previewSheet = DocumentPreviewBottomSheet.newInstance(
                    document = doc,
                    onDownload = { toDownload ->
                        viewModel.downloadDocument(requireContext(), toDownload)
                    }
                )
                previewSheet.show(parentFragmentManager, DocumentPreviewBottomSheet.TAG)
            },
            onDownloadClick = { doc ->
                viewModel.downloadDocument(requireContext(), doc)
            }
        )

        binding.rvDocuments.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = documentAdapter
        }
    }

    private fun setupListeners() {
        binding.swipeRefresh.setOnRefreshListener {
            viewModel.loadDocuments()
        }

        binding.btnSortSources.setOnClickListener {
            currentSortOrder = (currentSortOrder + 1) % 3
            when (currentSortOrder) {
                0 -> {
                    binding.btnSortSources.text = "Nama"
                    viewModel.filterDocuments(binding.etSearch.text?.toString().orEmpty())
                }
                1 -> {
                    binding.btnSortSources.text = "Ukuran"
                    Toast.makeText(requireContext(), "Urutkan berdasarkan ukuran berkas", Toast.LENGTH_SHORT).show()
                }
                2 -> {
                    binding.btnSortSources.text = "Terkini"
                    Toast.makeText(requireContext(), "Urutkan berdasarkan berkas terbaru", Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.btnDeleteModeSources.setOnClickListener {
            Toast.makeText(requireContext(), "Mode pilih berkas aktif. Centang berkas yang ingin dihapus.", Toast.LENGTH_SHORT).show()
        }

        binding.btnAddSource.setOnClickListener {
            filePickerLauncher.launch("*/*")
        }

        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val query = s?.toString().orEmpty()
                viewModel.filterDocuments(query)
                binding.btnClearSearch.visibility = if (query.isNotEmpty()) View.VISIBLE else View.GONE
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnClearSearch.setOnClickListener {
            binding.etSearch.text?.clear()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    binding.swipeRefresh.isRefreshing = state.isLoading
                    documentAdapter.submitList(state.filteredDocuments)
                    documentAdapter.setDownloadingId(state.downloadingDocId)

                    val count = state.filteredDocuments.size
                    binding.tvSourcesCountSubtitle.text = "$count berkas tersinkronisasi"

                    val isEmpty = !state.isLoading && state.filteredDocuments.isEmpty()
                    binding.layoutEmpty.visibility = if (isEmpty) View.VISIBLE else View.GONE

                    state.downloadedMessage?.let {
                        Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                        viewModel.clearMessages()
                    }

                    state.errorMessage?.let {
                        Toast.makeText(requireContext(), it, Toast.LENGTH_LONG).show()
                        viewModel.clearMessages()
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun newInstance() = ExplorerFragment()
    }
}
