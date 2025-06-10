'use client'

import { useUser } from '@clerk/nextjs'
import {
  useUserProfile,
  useUsageLimits,
  useHasPremiumAccess,
} from '@/contexts/UserContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getUserProjects,
  downloadProject,
  deleteProject,
} from '@/lib/project-service'
import { Project } from '@/lib/project-service'
import Link from 'next/link'
import Image from 'next/image'
import ClientOnly from '@/components/ClientOnly'
import ProfileDropdown from '@/components/ui/ProfileDropdown'
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Trash2,
  Clock,
  Eye,
  MoreVertical,
  Calendar,
  Images,
  FolderOpen,
  Sparkles,
  LayoutDashboard,
  RefreshCw,
} from 'lucide-react'

export default function ProjectsPage() {
  const { user } = useUser()
  const router = useRouter()
  const { userProfile, loading } = useUserProfile()
  const { currentUsage, currentLimit, hasReachedLimit } = useUsageLimits()
  const hasPremiumAccess = useHasPremiumAccess()

  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'public'>('all')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])

  const loadProjects = async () => {
    if (!user) return

    setLoadingProjects(true)
    try {
      const userProjects = await getUserProjects(user.id)
      setProjects(userProjects)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleDownloadProject = async (project: Project) => {
    try {
      await downloadProject(project)
    } catch (error) {
      console.error('Error downloading project:', error)
      alert('Failed to download project. Please try again.')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await deleteProject(projectId)
      setProjects(projects.filter((p) => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project. Please try again.')
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterBy === 'all' ||
      (filterBy === 'public' && project.is_public) ||
      (filterBy === 'recent' &&
        new Date(project.updated_at) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background flex items-center justify-center">
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">
            Loading your projects...
          </div>
          <div className="text-gray-400 text-sm mt-2">
            Preparing your workspace
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background">
      <div className="relative z-10 flex">
        {/* Sidebar Navigation - Matching Dashboard */}
        <div className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 min-h-screen">
          <div className="p-6">
            {/* App Logo */}
            <Link
              href="/"
              className="inline-flex items-center space-x-3 group mb-8">
              <div className="relative">
                <Image
                  src="https://i.ibb.co/0RYBCCPp/imageedit-3-7315062423.png"
                  alt="Imprintly Logo"
                  width={40}
                  height={40}
                  className="transition-transform duration-200 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl"></div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  Imprintly
                </span>
              </div>
            </Link>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                MAIN MENU
              </div>

              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200">
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                href="/create"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create</span>
              </Link>

              <Link
                href="/dashboard/projects"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FolderOpen className="w-5 h-5" />
                <span className="font-medium">Projects</span>
              </Link>

              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-8">
                OTHERS
              </div>

              <button
                onClick={() => loadProjects()}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 w-full text-left">
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Refresh Projects</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {/* Header - Matching Dashboard Style */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  My Projects 📁
                </h1>
                <p className="text-gray-400 text-sm">
                  {projects.length}{' '}
                  {projects.length === 1 ? 'project' : 'projects'} •{' '}
                  {currentUsage}/{currentLimit} usage
                </p>
              </div>

              {/* Right Side - Usage Indicator and Profile */}
              <div className="flex items-center space-x-4">
                {/* Circular Usage Indicator - Same as Dashboard */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center relative overflow-hidden">
                    {/* Progress Ring */}
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${
                          (currentUsage / currentLimit) * 283
                        } 283`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center Content */}
                    <div className="text-center z-10">
                      <div className="text-sm font-bold text-white">
                        {Math.round((currentUsage / currentLimit) * 100)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {currentUsage}/{currentLimit}
                      </div>
                    </div>
                  </div>

                  {/* Usage Label */}
                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
                    <div className="text-xs text-gray-400 text-center">
                      Usage
                    </div>
                  </div>
                </div>

                {/* Profile Dropdown */}
                <ClientOnly>
                  <ProfileDropdown />
                </ClientOnly>
              </div>
            </div>
            {/* Controls Bar - Dashboard Style */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-200 text-lg"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-200 text-lg">
                    <option value="all">All Projects</option>
                    <option value="recent">Recent (7 days)</option>
                    <option value="public">Public Projects</option>
                  </select>

                  <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}>
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}>
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Grid/List - Dashboard Style */}
            {loadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10">
                    <div className="aspect-video bg-gray-700/50 animate-pulse"></div>
                    <div className="p-6">
                      <div className="h-5 bg-gray-700/50 rounded-xl animate-pulse mb-3"></div>
                      <div className="h-4 bg-gray-700/50 rounded-lg animate-pulse w-2/3 mb-4"></div>
                      <div className="h-3 bg-gray-700/50 rounded-lg animate-pulse w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDownload={() => handleDownloadProject(project)}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredProjects.map((project) => (
                    <ProjectListItem
                      key={project.id}
                      project={project}
                      onDownload={() => handleDownloadProject(project)}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  ))}
                </div>
              )
            ) : (
              <EmptyState searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Project Card Component
function ProjectCard({
  project,
  onDownload,
  onDelete,
}: {
  project: Project
  onDownload: () => void
  onDelete: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="group bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="aspect-video bg-gray-700 relative overflow-hidden">
        <Image
          src={
            project.image_url &&
            (project.image_url.startsWith('http') ||
              project.image_url.startsWith('data:') ||
              project.image_url.startsWith('blob:'))
              ? project.image_url
              : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkF1dG8tU2F2ZWQgUHJvamVjdDwvdGV4dD48L3N2Zz4='
          }
          alt={project.title}
          fill
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Actions */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>

            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl z-10 overflow-hidden">
                <button
                  onClick={() => {
                    onDownload()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700/50 flex items-center gap-3 transition-colors">
                  <Download className="w-4 h-4" />
                  Download Project
                </button>
                <button
                  onClick={() => {
                    onDelete()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-700/50 flex items-center gap-3 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {project.is_public && (
          <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-medium border border-emerald-400/30">
            Public
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-bold text-white mb-2 text-xl truncate">
          {project.title}
        </h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{new Date(project.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Project List Item Component
function ProjectListItem({
  project,
  onDownload,
  onDelete,
}: {
  project: Project
  onDownload: () => void
  onDelete: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="group bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 p-6">
      <div className="flex items-center gap-6">
        {/* Thumbnail */}
        <div className="w-24 h-24 bg-gray-700 rounded-2xl overflow-hidden flex-shrink-0">
          <Image
            src={
              project.image_url &&
              (project.image_url.startsWith('http') ||
                project.image_url.startsWith('data:') ||
                project.image_url.startsWith('blob:'))
                ? project.image_url
                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODA4IiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkF1dG8tU2F2ZWQgUHJvamVjdDwvdGV4dD48L3N2Zz4='
            }
            alt={project.title}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white mb-2 text-xl truncate">
                {project.title}
              </h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {project.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                {project.is_public && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-emerald-400 font-medium">Public</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="relative ml-6">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors border border-white/10">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      onDownload()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700/50 flex items-center gap-3 transition-colors">
                    <Download className="w-4 h-4" />
                    Download Project
                  </button>
                  <button
                    onClick={() => {
                      onDelete()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-700/50 flex items-center gap-3 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Empty State Component - Dashboard Style
function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="text-center py-20 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl border border-white/10">
      <div className="max-w-md mx-auto">
        {searchQuery ? (
          <>
            <div className="w-32 h-32 bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <Search className="w-16 h-16 text-gray-400" />
              {/* Decorative dots */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-400 rounded-full opacity-60"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gray-500 rounded-full opacity-40"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No projects found
            </h3>
            <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">
              No projects match your search for "{searchQuery}". Try adjusting
              your search terms or browse all projects.
            </p>
          </>
        ) : (
          <>
            <div className="w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <FolderOpen className="w-16 h-16 text-gray-400" />
              {/* Decorative dots */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full opacity-60"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full opacity-40"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No projects yet
            </h3>
            <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">
              Start your creative journey by creating your first text-behind
              effect project.
            </p>
          </>
        )}

        <Link
          href="/create"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg">
          <Sparkles className="w-5 h-5" />
          <span>Create Your First Project</span>
        </Link>
      </div>
    </div>
  )
}
