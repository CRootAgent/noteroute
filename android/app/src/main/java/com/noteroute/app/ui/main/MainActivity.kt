package com.noteroute.app.ui.main

import android.os.Bundle
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import com.noteroute.app.R
import com.noteroute.app.databinding.ActivityMainBinding
import com.noteroute.app.ui.home.HomeFragment
import com.noteroute.app.ui.workspace.WorkspaceFragment

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val homeFragment by lazy {
        HomeFragment.newInstance().apply {
            onNotebookSelectedListener = { notebook ->
                openWorkspace(notebook.name)
            }
            onCreateNewNotebookListener = {
                openWorkspace("Untitled Notebook")
            }
        }
    }

    private var currentWorkspaceFragment: WorkspaceFragment? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Hide legacy bottom nav in MainActivity because Home and Workspace have their own ergonomic navigation
        binding.bottomNavigation.visibility = android.view.View.GONE

        if (savedInstanceState == null) {
            showHome()
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (currentWorkspaceFragment != null && currentWorkspaceFragment?.isVisible == true) {
                    showHome()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun showHome() {
        currentWorkspaceFragment = null
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, homeFragment)
            .commit()
    }

    private fun openWorkspace(title: String) {
        val workspace = WorkspaceFragment.newInstance(title).apply {
            onBackToHomeListener = {
                showHome()
            }
        }
        currentWorkspaceFragment = workspace
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, workspace)
            .commit()
    }
}
