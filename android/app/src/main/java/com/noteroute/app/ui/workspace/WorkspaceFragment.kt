package com.noteroute.app.ui.workspace

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.PopupMenu
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.noteroute.app.R
import com.noteroute.app.databinding.FragmentWorkspaceBinding
import com.noteroute.app.ui.chat.ChatFragment
import com.noteroute.app.ui.components.AiConfigBottomSheet
import com.noteroute.app.ui.components.RenameNotebookBottomSheet
import com.noteroute.app.ui.explorer.ExplorerFragment
import com.noteroute.app.ui.studio.StudioFragment
import com.noteroute.app.utils.UserPreferences

class WorkspaceFragment : Fragment() {

    private var _binding: FragmentWorkspaceBinding? = null
    private val binding get() = _binding!!

    private var notebookTitle: String = "Untitled Notebook"
    private var workspaceId: String = "6727bd89f1a23b0012e84101"
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

        binding.btnShareWorkspace.setOnClickListener {
            shareNotebook()
        }

        binding.btnMenuWorkspace.setOnClickListener { view ->
            showWorkspaceOptionsMenu(view)
        }

        setupBottomNavigation()

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

    private fun shareNotebook() {
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TITLE, notebookTitle)
            putExtra(
                Intent.EXTRA_TEXT,
                "📚 *NoteRoute Notebook: $notebookTitle*\n\nAkses materi dan tanya-jawab AI grounded dari dokumen laptop saya di: https://noteroute.alwaysdata.net\n\n_Diproduksi oleh NoteRoute Cross-Device Agent_"
            )
            type = "text/plain"
        }
        val shareIntent = Intent.createChooser(sendIntent, "Bagikan Notebook NoteRoute")
        startActivity(shareIntent)
    }

    private fun showWorkspaceOptionsMenu(view: View) {
        val popup = PopupMenu(requireContext(), view)
        popup.menu.add(0, 1, 1, "✏️ Ubah Nama Notebook")
        popup.menu.add(0, 2, 2, "⚙️ Setelan AI & Router Failover")
        popup.menu.add(0, 3, 3, "🗑️ Bersihkan Riwayat Chat")
        popup.menu.add(0, 4, 4, "❌ Hapus Notebook")

        popup.setOnMenuItemClickListener { item: MenuItem ->
            when (item.itemId) {
                1 -> {
                    showRenameSheet()
                    true
                }
                2 -> {
                    val aiSheet = AiConfigBottomSheet.newInstance()
                    aiSheet.show(parentFragmentManager, AiConfigBottomSheet.TAG)
                    true
                }
                3 -> {
                    chatFragment.clearChatHistory()
                    Toast.makeText(requireContext(), "Riwayat chat berhasil dibersihkan", Toast.LENGTH_SHORT).show()
                    true
                }
                4 -> {
                    AlertDialog.Builder(requireContext())
                        .setTitle("Hapus Notebook")
                        .setMessage("Apakah Anda yakin ingin menghapus notebook '$notebookTitle'?")
                        .setPositiveButton("Hapus") { _, _ ->
                            val userPrefs = UserPreferences.getInstance(requireContext())
                            userPrefs.deleteLocalWorkspace(workspaceId)
                            Toast.makeText(requireContext(), "Notebook '$notebookTitle' telah dihapus", Toast.LENGTH_SHORT).show()
                            onBackToHomeListener?.invoke()
                        }
                        .setNegativeButton("Batal", null)
                        .show()
                    true
                }
                else -> false
            }
        }
        popup.show()
    }

    private fun showRenameSheet() {
        val sheet = RenameNotebookBottomSheet.newInstance(notebookTitle) { newName ->
            notebookTitle = newName
            binding.tvWorkspaceTitle.text = newName
            val userPrefs = UserPreferences.getInstance(requireContext())
            userPrefs.updateLocalWorkspaceName(workspaceId, newName)
            Toast.makeText(requireContext(), "Judul notebook diperbarui!", Toast.LENGTH_SHORT).show()
        }
        sheet.show(parentFragmentManager, RenameNotebookBottomSheet.TAG)
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
