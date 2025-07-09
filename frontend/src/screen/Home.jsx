import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from "../config/axios";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
    const { user } = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState("grid"); // grid or list view

    const navigate = useNavigate();

    function createProject(e) {
        e.preventDefault();
        axios.post('/projects/create', { 
            name: projectName,
            description: projectDescription || "No description provided" 
        })
            .then((res) => {
                setProjects(prev => [...prev, res.data.project]);
                setProjectName("");
                setProjectDescription("");
                setIsModalOpen(false);
            })
            .catch((error) => console.log(error));
    }

    useEffect(() => {
        setIsLoading(true);
        axios.get('/projects/all')
            .then((res) => {
                setProjects(res.data.projects);
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            });
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Color variants for project cards
    const cardColors = [
        "from-blue-500/10 to-indigo-500/10 border-blue-200/50",
        "from-purple-500/10 to-pink-500/10 border-purple-200/50",
        "from-emerald-500/10 to-teal-500/10 border-emerald-200/50",
        "from-amber-500/10 to-orange-500/10 border-amber-200/50"
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header Section */}
            <header className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-10 px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-600/20"></div>
                
                <div className="max-w-7xl mx-auto relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <i className="ri-code-box-fill text-2xl"></i>
                                </div>
                                <h1 className="text-3xl font-bold">DevNest-AI</h1>
                            </div>
                            <p className="text-slate-300 text-lg max-w-xl">
                                Your AI-powered collaborative workspace. Code, chat, and create with intelligent assistance.
                            </p>
                        </div>
                        
                        <div className="mt-6 md:mt-0 flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50">
                                <i className="ri-user-3-fill text-blue-400"></i>
                                <span className="text-sm font-medium">{user?.email || "Guest"}</span>
                            </div>
                            
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full py-2 px-6 font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <i className="ri-add-line"></i>
                                New Project
                            </motion.button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
                {/* Search and controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="relative w-full md:w-auto flex-grow max-w-lg">
                        <i className="ri-search-line absolute left-4 top-3.5 text-slate-400"></i>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <div className="bg-white rounded-lg p-1 flex items-center border border-slate-200 shadow-sm">
                            <button 
                                onClick={() => setView("grid")} 
                                className={`p-2 rounded ${view === "grid" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}
                            >
                                <i className="ri-grid-fill"></i>
                            </button>
                            <button 
                                onClick={() => setView("list")} 
                                className={`p-2 rounded ${view === "list" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}
                            >
                                <i className="ri-list-check"></i>
                            </button>
                        </div>
                        
                        <select className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-600 shadow-sm">
                            <option>Last updated</option>
                            <option>Name A-Z</option>
                            <option>Recently created</option>
                        </select>
                    </div>
                </div>

                {/* Projects Grid/List */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {view === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence>
                                    {filteredProjects.length > 0 ? (
                                        <>
                                            {filteredProjects.map((project, idx) => (
                                                <motion.div
                                                    key={project._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => navigate(`/project`, { state: { project } })}
                                                    className={`cursor-pointer rounded-xl p-5 border bg-gradient-to-br ${cardColors[idx % cardColors.length]} hover:shadow-md transition flex flex-col`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h2 className="text-lg font-semibold text-slate-800 line-clamp-1">{project.name}</h2>
                                                        <div className="bg-white/70 backdrop-blur-sm rounded-full h-8 w-8 flex items-center justify-center text-slate-600">
                                                            <i className="ri-message-3-line"></i>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
                                                        <div className="flex -space-x-2">
                                                            {project.users.slice(0, 3).map((user, i) => (
                                                                <div key={i} className="h-7 w-7 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-800">
                                                                    {user.email?.charAt(0).toUpperCase()}
                                                                </div>
                                                            ))}
                                                            {project.users.length > 3 && (
                                                                <div className="h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs">
                                                                    +{project.users.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </>
                                    ) : (
                                        <motion.div
                                            className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="bg-slate-100 rounded-full p-4 mb-4">
                                                <i className="ri-folder-warning-line text-3xl text-slate-400"></i>
                                            </div>
                                            <p className="text-lg font-medium mb-2">No projects found</p>
                                            <p className="text-slate-400 text-center max-w-md">
                                                {searchTerm ? "Try a different search term or " : ""}
                                                create your first project to get started with DevNest-AI.
                                            </p>
                                            <button 
                                                onClick={() => setIsModalOpen(true)}
                                                className="mt-4 text-blue-500 font-medium flex items-center gap-1"
                                            >
                                                <i className="ri-add-line"></i> New Project
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                {filteredProjects.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {filteredProjects.map((project, idx) => (
                                            <motion.div
                                                key={project._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => navigate(`/project`, { state: { project } })}
                                                className="cursor-pointer p-4 hover:bg-slate-50 transition flex items-center gap-4"
                                            >
                                                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${idx % 2 === 0 ? 'from-blue-500 to-indigo-600' : 'from-purple-500 to-pink-600'} flex items-center justify-center text-white`}>
                                                    <i className="ri-chat-3-line"></i>
                                                </div>
                                                
                                                <div className="flex-grow">
                                                    <h3 className="font-medium text-slate-800">{project.name}</h3>
                                                </div>
                                                
                                                <div className="flex items-center gap-6">
                                                    <div className="flex -space-x-2">
                                                        {project.users.slice(0, 3).map((user, i) => (
                                                            <div key={i} className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                                                                {user.email?.charAt(0).toUpperCase()}
                                                            </div>
                                                        ))}
                                                        {project.users.length > 3 && (
                                                            <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs">
                                                                +{project.users.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <button className="text-slate-400 hover:text-slate-700">
                                                        <i className="ri-more-2-fill"></i>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                                        <div className="bg-slate-100 rounded-full p-4 mb-4">
                                            <i className="ri-folder-warning-line text-3xl text-slate-400"></i>
                                        </div>
                                        <p className="text-lg font-medium mb-2">No projects found</p>
                                        <p className="text-slate-400">Create your first project to get started with DevNest-AI.</p>
                                        <button 
                                            onClick={() => setIsModalOpen(true)}
                                            className="mt-4 text-blue-500 font-medium flex items-center gap-1"
                                        >
                                            <i className="ri-add-line"></i> New Project
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Project Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden"
                        >
                            <div className="p-5 border-b border-slate-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-slate-800">Create Project</h2>
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <i className="ri-close-line text-xl"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <form onSubmit={createProject} className="p-5">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter project name"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1 justify-between">
                                            <span>Description</span> 
                                            <span className="text-slate-400">Optional</span>
                                        </label>
                                        <textarea
                                            value={projectDescription}
                                            onChange={(e) => setProjectDescription(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                            placeholder="Enter project description"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                                    >
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default Home;