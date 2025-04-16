import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const Home = () => {
    const { user } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState("")
    const [project, setProject] = useState([])
    const [searchTerm, setSearchTerm] = useState("")

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        axios.post('/projects/create', { name: projectName })
            .then((res) => {
                setProject(prev => [...prev, res.data.project])
                setProjectName("")
                setIsModalOpen(false)
            })
            .catch((error) => console.log(error))
    }

    useEffect(() => {
        axios.get('/projects/all')
            .then((res) => setProject(res.data.projects))
            .catch(err => console.log(err))
    }, [])

    const filteredProjects = project.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <main className="p-6 min-h-screen bg-gradient-to-br from-white to-slate-100">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome{user?.email ? `, ${user.email}` : ''} 👋</h1>
                <p className="text-slate-600 text-lg">Manage your projects below or start a new one.</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 max-w-md mx-auto">
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="border border-dashed border-slate-300 bg-white/70 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center hover:shadow-xl transition cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                >
                    <div className="text-5xl text-slate-500">
                        <i className="ri-add-box-line"></i>
                    </div>
                    <p className="mt-2 font-semibold text-slate-700">New Project</p>
                </motion.div>

                <AnimatePresence>
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project, idx) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/project`, { state: { project } })}
                                className="cursor-pointer rounded-2xl p-5 border border-slate-200 shadow-sm bg-white/80 backdrop-blur-md hover:shadow-md transition flex flex-col gap-3"
                            >
                                <h2 className="text-lg font-semibold text-slate-800">{project.name}</h2>
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <i className="ri-user-line"></i>
                                    {project.users.length} Collaborator{project.users.length !== 1 ? 's' : ''}
                                </div>
                                {project.createdAt && (
                                    <p className="text-xs text-slate-400">
                                        Created on {new Date(project.createdAt).toLocaleDateString()}
                                    </p>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            className="col-span-full text-center text-slate-500 mt-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <i className="ri-folder-warning-line text-4xl mb-2"></i>
                            <p>No projects found. Create your first one!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200"
                    >
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Create New Project</h2>
                        <form onSubmit={createProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </main>
    )
}

export default Home
