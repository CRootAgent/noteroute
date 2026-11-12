package com.noteroute.app.ui.home

import android.view.LayoutInflater
import android.view.MenuItem
import android.view.ViewGroup
import android.widget.PopupMenu
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.noteroute.app.data.model.WorkspaceItem
import com.noteroute.app.databinding.ItemNotebookBinding

class NotebookAdapter(
    private val onNotebookClick: (WorkspaceItem) -> Unit,
    private val onRenameClick: ((WorkspaceItem) -> Unit)? = null,
    private val onShareClick: ((WorkspaceItem) -> Unit)? = null,
    private val onDeleteClick: ((WorkspaceItem) -> Unit)? = null
) : ListAdapter<WorkspaceItem, NotebookAdapter.NotebookViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotebookViewHolder {
        val binding = ItemNotebookBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return NotebookViewHolder(binding)
    }

    override fun onBindViewHolder(holder: NotebookViewHolder, position: Int) {
        holder.bind(getItem(position), position)
    }

    inner class NotebookViewHolder(
        private val binding: ItemNotebookBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: WorkspaceItem, position: Int) {
            binding.tvNotebookTitle.text = item.name
            val docCount = item.documentCount
            binding.tvNotebookMeta.text = if (docCount > 0) "$docCount sumber • Tersimpan" else "0 sumber • Barusan dibuat"

            val isEven = (position % 2 == 0)
            val iconTint = if (isEven) 0xFFF59E0B.toInt() else 0xFF3B82F6.toInt()
            val bgTint = if (isEven) 0x26F59E0B.toInt() else 0x263B82F6.toInt()

            binding.layoutIconContainer.backgroundTintList = android.content.res.ColorStateList.valueOf(bgTint)
            binding.ivNotebookIcon.setColorFilter(iconTint)

            binding.root.setOnClickListener {
                onNotebookClick(item)
            }

            binding.btnNotebookMenu.setOnClickListener { view ->
                val popup = PopupMenu(view.context, view)
                popup.menu.add(0, 1, 1, "✏️ Ubah Nama")
                popup.menu.add(0, 2, 2, "📤 Bagikan Notebook")
                popup.menu.add(0, 3, 3, "🗑️ Hapus Notebook")

                popup.setOnMenuItemClickListener { menuItem: MenuItem ->
                    when (menuItem.itemId) {
                        1 -> {
                            onRenameClick?.invoke(item)
                            true
                        }
                        2 -> {
                            onShareClick?.invoke(item)
                            true
                        }
                        3 -> {
                            onDeleteClick?.invoke(item)
                            true
                        }
                        else -> false
                    }
                }
                popup.show()
            }
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<WorkspaceItem>() {
            override fun areItemsTheSame(oldItem: WorkspaceItem, newItem: WorkspaceItem): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: WorkspaceItem, newItem: WorkspaceItem): Boolean {
                return oldItem == newItem
            }
        }
    }
}
