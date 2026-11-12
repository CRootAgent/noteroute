package com.noteroute.app.ui.home

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.noteroute.app.data.model.WorkspaceItem
import com.noteroute.app.data.repository.NoteRouteRepository
import com.noteroute.app.databinding.FragmentHomeBinding
import com.noteroute.app.ui.components.AuthBottomSheet
import com.noteroute.app.ui.components.CreateNotebookBottomSheet
import com.noteroute.app.ui.components.ProfileBottomSheet
import com.noteroute.app.ui.components.RenameNotebookBottomSheet
import com.noteroute.app.utils.UserPreferences
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private lateinit var notebookAdapter: NotebookAdapter
    private val repository = NoteRouteRepository()
    private var allNotebooksList: List<WorkspaceItem> = emptyList()

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
        checkAuthOnFirstLaunch()
        loadNotebooks()
    }

    private fun checkAuthOnFirstLaunch() {
        val userPrefs = UserPreferences.getInstance(requireContext())
        binding.tvProfileInitial.text = userPrefs.getUserInitial()

        if (!userPrefs.isLoggedIn) {
            val authSheet = AuthBottomSheet.newInstance {
                binding.tvProfileInitial.text = userPrefs.getUserInitial()
                loadNotebooks()
            }
            authSheet.isCancelable = false
            authSheet.show(childFragmentManager, AuthBottomSheet.TAG)
        }
    }

    private fun setupRecyclerView() {
        notebookAdapter = NotebookAdapter(
            onNotebookClick = { notebook ->
                onNotebookSelectedListener?.invoke(notebook)
            },
            onRenameClick = { notebook ->
                showRenameNotebookSheet(notebook)
            },
            onShareClick = { notebook ->
                shareNotebook(notebook)
            },
            onDeleteClick = { notebook ->
                confirmDeleteNotebook(notebook)
            }
        )

        binding.rvNotebooks.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = notebookAdapter
        }
    }

    private fun setupListeners() {
        binding.btnCreateNewNotebook.setOnClickListener {
            showCreateNotebookSheet()
        }

        binding.btnProfileAvatar.setOnClickListener {
            val sheet = ProfileBottomSheet.newInstance()
            sheet.show(childFragmentManager, ProfileBottomSheet.TAG)
        }

        binding.btnHomeSearch.setOnClickListener {
            val searchBar = binding.layoutHomeSearchBar
            if (searchBar.visibility == View.VISIBLE) {
                searchBar.visibility = View.GONE
                binding.etHomeSearch.text?.clear()
                filterNotebooks("")
            } else {
                searchBar.visibility = View.VISIBLE
                binding.etHomeSearch.requestFocus()
            }
        }

        binding.etHomeSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val query = s?.toString().orEmpty()
                filterNotebooks(query)
                binding.btnClearHomeSearch.visibility = if (query.isNotEmpty()) View.VISIBLE else View.GONE
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnClearHomeSearch.setOnClickListener {
            binding.etHomeSearch.text?.clear()
        }

        binding.btnBatchDelete.setOnClickListener {
            showBatchDeleteDialog()
        }
    }

    private fun filterNotebooks(query: String) {
        if (query.isBlank()) {
            notebookAdapter.submitList(allNotebooksList)
            updateEmptyState(allNotebooksList.isEmpty())
        } else {
            val filtered = allNotebooksList.filter {
                it.name.contains(query, ignoreCase = true) ||
                        (it.description?.contains(query, ignoreCase = true) == true)
            }
            notebookAdapter.submitList(filtered)
            updateEmptyState(filtered.isEmpty())
        }
    }

    private fun showCreateNotebookSheet() {
        val sheet = CreateNotebookBottomSheet.newInstance { name, desc ->
            createNotebook(name, desc)
        }
        sheet.show(childFragmentManager, CreateNotebookBottomSheet.TAG)
    }

    private fun createNotebook(name: String, desc: String) {
        val userPrefs = UserPreferences.getInstance(requireContext())
        val newWorkspace = WorkspaceItem(
            id = "ws_${System.currentTimeMillis()}",
            name = name,
            description = desc,
            documentCount = 0,
            createdAt = "2026-11-10T10:00:00.000Z"
        )

        userPrefs.addLocalWorkspace(newWorkspace)
        Toast.makeText(requireContext(), "Notebook '$name' berhasil dibuat!", Toast.LENGTH_SHORT).show()
        loadNotebooks()
        onNotebookSelectedListener?.invoke(newWorkspace)

        CoroutineScope(Dispatchers.IO).launch {
            repository.createWorkspace(name, desc)
        }
    }

    private fun showRenameNotebookSheet(notebook: WorkspaceItem) {
        val sheet = RenameNotebookBottomSheet.newInstance(notebook.name) { newName ->
            val userPrefs = UserPreferences.getInstance(requireContext())
            userPrefs.updateLocalWorkspaceName(notebook.id, newName)
            Toast.makeText(requireContext(), "Nama notebook diperbarui!", Toast.LENGTH_SHORT).show()
            loadNotebooks()
        }
        sheet.show(childFragmentManager, RenameNotebookBottomSheet.TAG)
    }

    private fun shareNotebook(notebook: WorkspaceItem) {
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TITLE, notebook.name)
            putExtra(
                Intent.EXTRA_TEXT,
                "📚 *NoteRoute Notebook: ${notebook.name}*\n\nAkses notebook & dokumen tersinkronisasi di: https://noteroute.alwaysdata.net"
            )
            type = "text/plain"
        }
        startActivity(Intent.createChooser(sendIntent, "Bagikan Notebook"))
    }

    private fun confirmDeleteNotebook(notebook: WorkspaceItem) {
        AlertDialog.Builder(requireContext())
            .setTitle("Hapus Notebook")
            .setMessage("Apakah Anda yakin ingin menghapus '${notebook.name}'?")
            .setPositiveButton("Hapus") { _, _ ->
                val userPrefs = UserPreferences.getInstance(requireContext())
                userPrefs.deleteLocalWorkspace(notebook.id)
                Toast.makeText(requireContext(), "Notebook telah dihapus", Toast.LENGTH_SHORT).show()
                loadNotebooks()
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun showBatchDeleteDialog() {
        if (allNotebooksList.isEmpty()) {
            Toast.makeText(requireContext(), "Belum ada notebook untuk dihapus.", Toast.LENGTH_SHORT).show()
            return
        }

        val names = allNotebooksList.map { it.name }.toTypedArray()
        val checkedItems = BooleanArray(names.size) { false }

        AlertDialog.Builder(requireContext())
            .setTitle("Hapus Masal Notebook")
            .setMultiChoiceItems(names, checkedItems) { _, which, isChecked ->
                checkedItems[which] = isChecked
            }
            .setPositiveButton("Hapus Terpilih") { _, _ ->
                val selectedIds = allNotebooksList.filterIndexed { index, _ -> checkedItems[index] }
                    .map { it.id }.toSet()

                if (selectedIds.isNotEmpty()) {
                    val userPrefs = UserPreferences.getInstance(requireContext())
                    userPrefs.deleteLocalWorkspacesBatch(selectedIds)
                    Toast.makeText(requireContext(), "${selectedIds.size} notebook dihapus.", Toast.LENGTH_SHORT).show()
                    loadNotebooks()
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    private fun loadNotebooks() {
        val userPrefs = UserPreferences.getInstance(requireContext())
        binding.tvProfileInitial.text = userPrefs.getUserInitial()

        val localList = userPrefs.getLocalWorkspaces()
        allNotebooksList = localList
        notebookAdapter.submitList(allNotebooksList)
        updateEmptyState(allNotebooksList.isEmpty())

        CoroutineScope(Dispatchers.IO).launch {
            val result = repository.getWorkspaces()
            withContext(Dispatchers.Main) {
                result.getOrNull()?.let { remoteList ->
                    if (remoteList.isNotEmpty()) {
                        val merged = (remoteList + localList).distinctBy { it.id }
                        allNotebooksList = merged
                        userPrefs.saveLocalWorkspaces(merged)
                        notebookAdapter.submitList(allNotebooksList)
                        updateEmptyState(allNotebooksList.isEmpty())
                    }
                }
            }
        }
    }

    private fun updateEmptyState(isEmpty: Boolean) {
        if (isEmpty) {
            binding.layoutEmptyNotebooks.visibility = View.VISIBLE
            binding.rvNotebooks.visibility = View.GONE
        } else {
            binding.layoutEmptyNotebooks.visibility = View.GONE
            binding.rvNotebooks.visibility = View.VISIBLE
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
