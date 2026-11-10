package com.noteroute.app.ui.workspace

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.noteroute.app.R
import com.noteroute.app.databinding.FragmentWorkspaceBinding
import com.noteroute.app.ui.chat.ChatFragment
import com.noteroute.app.ui.explorer.ExplorerFragment
import com.noteroute.app.ui.studio.StudioFragment

class WorkspaceFragment : Fragment() {

    private var _binding: FragmentWorkspaceBinding? = null
    private val binding get() = _binding!!

    private var notebookTitle: String = "Materi Kuliah Semester 5 • Sistem Terdistribusi"
    var onBackToHomeListener: (() -> Unit)? = null

    private val sourcesFragment by lazy { ExplorerFragment.newInstance() }
    private val chatFragment by lazy { ChatFragment.newInstance() }
    private val studioFragment by lazy { StudioFragment.newInstance() }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentWorkspaceBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tvWorkspaceTitle.text = notebookTitle

        binding.btnBackHome.setOnClickListener {
            onBackToHomeListener?.invoke()
        }

        binding.layoutTitleClick.setOnClickListener {
            showRenameDialog()
        }

        binding.btnShareWorkspace.setOnClickListener {
            Toast.makeText(requireContext(), "Tautan notebook disalin ke papan klip.", Toast.LENGTH_SHORT).show()
        }

        binding.btnMenuWorkspace.setOnClickListener {
            Toast.makeText(requireContext(), "Opsi: Ekspor Catatan, Bersihkan Riwayat, Setelan AI.", Toast.LENGTH_SHORT).show()
        }

        setupBottomNavigation()

        // Default to Chat Tab as specified in docs/android.html line 812
        if (savedInstanceState == null) {
            replaceTabFragment(chatFragment)
            binding.workspaceBottomNav.selectedItemId = R.id.tab_chat
        }
    }

    fun setTitle(title: String) {
        notebookTitle = title
        _binding?.tvWorkspaceTitle?.text = title
    }

    private fun setupBottomNavigation() {
        binding.workspaceBottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.tab_sources -> {
                    replaceTabFragment(sourcesFragment)
                    true
                }
                R.id.tab_chat -> {
                    replaceTabFragment(chatFragment)
                    true
                }
                R.id.tab_studio -> {
                    replaceTabFragment(studioFragment)
                    true
                }
                else -> false
            }
        }
    }

    private fun replaceTabFragment(fragment: Fragment) {
        childFragmentManager.beginTransaction()
            .replace(R.id.workspace_fragment_container, fragment)
            .commit()
    }

    private fun showRenameDialog() {
        val input = EditText(requireContext()).apply {
            setText(notebookTitle)
            selectAll()
        }
        AlertDialog.Builder(requireContext())
            .setTitle("Ubah Nama Notebook")
            .setView(input)
            .setPositiveButton("Simpan") { _, _ ->
                val newTitle = input.text.toString().trim()
                if (newTitle.isNotEmpty()) {
                    notebookTitle = newTitle
                    binding.tvWorkspaceTitle.text = newTitle
                    Toast.makeText(requireContext(), "Judul diperbarui: $newTitle", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Batal", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        fun newInstance(title: String = "Untitled Notebook"): WorkspaceFragment {
            val fragment = WorkspaceFragment()
            fragment.notebookTitle = title
            return fragment
        }
    }
}
