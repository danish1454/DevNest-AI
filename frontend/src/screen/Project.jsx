import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, recieveMessages, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state?.project);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [aiResponses, setAiResponses] = useState([]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const { user } = useContext(UserContext);
  const messageBox = useRef(null);
  const aiBox = useRef(null);
  const [users, setUsers] = useState([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(null);

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedId) => {
      const newSelectedUserId = new Set(prevSelectedId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      return newSelectedUserId;
    });
  };

  const addCollaborators = () => {
    axios
      .put('/projects/add-user', {
        projectId: location.state?.project?._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        setIsModalOpen(false);
        // Show success notification
        showNotification('Collaborators added successfully');
      })
      .catch((err) => {
        console.error(err);
        showNotification('Failed to add collaborators', 'error');
      });
  };

  const showNotification = (message, type = 'success') => {
    // A simple notification implementation
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white text-sm`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };

  const send = () => {
    if (!message.trim()) return;
    
    const outgoingMessage = {
      message,
      sender: { email: user.email },
      timestamp: new Date().toISOString(),
    };

    if (message.trim().startsWith('@ai')) {
      setIsAiResponding(true);
    }

    sendMessage('project-message', outgoingMessage);
    setMessages((prevMessages) => [...prevMessages, outgoingMessage]);
    setMessage('');
  };

  const scrollToBottom = () => {
    const box = messageBox.current;
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  // Simulated emojis for the picker
  const emojis = ['😊', '👍', '🚀', '💻', '🤖', '⚡', '🔥', '✨', '👨‍💻', '👩‍💻', '🌟'];

  useEffect(() => {
    if (project?._id) {
      initializeSocket(project._id);

      recieveMessages('project-message', (data) => {
        if (data.sender?._id === 'ai') {
          setAiResponses((prev) => [...prev, data]);
          setIsAiResponding(false); 
        } else {
          setMessages((prevMessages) => [...prevMessages, data]);
          
          // Random typing indicator from other users
          if (data.sender?.email !== user.email && Math.random() > 0.7) {
            setTimeout(() => {
              setTypingIndicator(data.sender?.email);
              setTimeout(() => setTypingIndicator(null), 3000 + Math.random() * 2000);
            }, 1000);
          }
        }
      });

      axios.get(`/projects/get-project/${project._id}`).then((res) => {
        setProject(res.data.project);
      });
    }

    axios
      .get('/users/all')
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.error(err);
      });
      
    // Set document title to include project name
    document.title = `${project?.name || 'Project'} | DevNest-AI`;
    
    return () => {
      document.title = 'DevNest-AI';
    };
  }, [project?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiResponses]);

  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }, 100);
  }, [aiResponses]);

  return (
    <main className="h-screen w-screen flex text-white bg-[#0b1221] font-sans">
      <aside className="w-64 bg-[#1a2234] flex flex-col border-r border-slate-700">
        {/* Sidebar Left */}
        <header className="p-4 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg shadow-lg">
              <span className="text-sm font-bold">DN</span>
            </div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
              DevNest-AI
            </h1>
          </div>
          <button onClick={() => setisSidePanelOpen(!isSidePanelOpen)} className="p-2 hover:bg-slate-800 rounded-full transition">
            <i className="ri-group-fill text-lg"></i>
          </button>
        </header>

        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Projects</h2>
            <span className="text-xs px-2 py-0.5 bg-blue-600 rounded-full">Beta</span>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 p-3 rounded-lg border border-blue-500/30">
            <h3 className="font-medium text-sm">{project?.name || 'Current Project'}</h3>
            <p className="text-xs text-slate-300 mt-1">
              {project?.description || 'Collaborative workspace with AI assistance'}
            </p>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-slate-700">
          <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition p-2 rounded-lg">
            <i className="ri-user-add-line"></i>
            <span className="text-sm">Add Collaborators</span>
          </button>
        </div>

        <div className={`fixed top-0 left-0 w-64 h-full bg-[#1a2234] shadow-xl z-40 transition-transform duration-300 ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <header className="p-4 flex justify-between items-center border-b border-slate-600">
            <div className="flex items-center gap-2">
              <i className="ri-team-fill text-blue-400"></i>
              <h1 className="text-sm font-semibold">Team Members</h1>
            </div>
            <button onClick={() => setisSidePanelOpen(false)} className="p-1 hover:text-red-500">
              <i className="ri-close-fill text-xl"></i>
            </button>
          </header>
          <div className="p-3 space-y-3">
            {project?.users?.map((user) => (
              <div key={user._id} className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-md hover:bg-slate-800 transition">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {user?.email && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                  )}

                </div>
                <div>
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex flex-col flex-grow relative overflow-hidden">
        {/* Chat header */}
        <div className="h-16 px-6 flex items-center justify-between bg-[#1a2234] border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-blue-600 rounded-lg flex items-center justify-center">
              <i className="ri-chat-3-fill text-lg"></i>
            </div>
            <div>
              <h2 className="font-medium">{project?.name || 'Project Chat'}</h2>
              <div className="flex items-center text-xs text-slate-400">
                <span>{project?.users?.length || 0} collaborators</span>
              </div>
            </div>
          </div>
        </div>

        <div 
          ref={messageBox}
          className="flex-grow p-6 space-y-4 overflow-y-auto no-scrollbar bg-[#0b1221] max-h-[calc(100vh-8rem)] message-box"
        >
          {/* Welcome message */}
          <div className="flex flex-col items-center justify-center py-6 px-4 gap-2 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-2xl font-bold">DN</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
              Welcome to DevNest-AI
            </h2>
            <p className="text-sm text-slate-300 max-w-md">
              Collaborate with your team and get AI-powered assistance. Use <code className="px-1 py-0.5 bg-slate-800 rounded text-xs">@ai</code> to ask questions.
            </p>
          </div>

          {messages.map((msg, index) => {
            const isCurrentUser = msg.sender?.email === user.email;
            return (
              <div
                key={index}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end gap-2 max-w-lg ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                  {!isCurrentUser && (
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mb-1 text-xs font-medium">
                      {msg.sender?.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl break-words ${
                      isCurrentUser 
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none" 
                        : "bg-slate-700 rounded-bl-none"
                    }`}
                  >
                    {!isCurrentUser && (
                      <small className="text-xs opacity-70 block mb-1">{msg.sender?.email}</small>
                    )}
                    <div className="mt-1 text-sm whitespace-pre-wrap overflow-hidden">{msg.message}</div>
                    <div className="mt-1 text-right">
                      <small className="text-xs opacity-60">{formatTime(msg.timestamp)}</small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {typingIndicator && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2 max-w-lg">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mb-1 text-xs font-medium">
                  {typingIndicator.charAt(0).toUpperCase()}
                </div>
                <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-none">
                  <small className="text-xs opacity-70 block mb-1">{typingIndicator}</small>
                  <div className="flex gap-1 mt-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-3xl bg-slate-800/70 backdrop-blur-md p-3 rounded-full flex items-center gap-3 shadow-lg border border-slate-700">
          <button onClick={toggleEmojiPicker} className="p-2 hover:bg-slate-700 rounded-full transition">
            <i className="ri-emotion-line text-lg"></i>
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type your message or @ai for AI assistance..."
            className="flex-grow bg-transparent outline-none text-white placeholder-slate-400 px-3"
          />
          
          <button onClick={send} className={`p-2 rounded-full transition ${
            message.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-400 cursor-not-allowed'
          }`}>
            <i className="ri-send-plane-2-fill text-lg"></i>
          </button>
          
          {/* Emoji picker */}
          {isEmojiPickerOpen && (
            <div className="absolute bottom-16 left-0 bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-700 grid grid-cols-6 gap-1">
              {emojis.map((emoji, index) => (
                <button 
                  key={index}
                  onClick={() => addEmoji(emoji)} 
                  className="text-lg p-2 hover:bg-slate-700 rounded transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="w-96 bg-[#1a1a32] border-l border-slate-800 p-4 hidden lg:flex flex-col">
        <header className="flex items-center gap-3 pb-4 border-b border-slate-700">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-500 rounded-full flex items-center justify-center">
            <i className="ri-robot-fill"></i>
          </div>
          <div>
            <h2 className="font-semibold text-white">DevNest AI Assistant</h2>
            <p className="text-xs text-slate-400">Powered by Google Gemini</p>
          </div>
        </header>
        
        <div className="py-3 text-xs text-slate-400 flex items-center justify-between">
          <span>AI Conversation History</span>
          <span className="px-2 py-0.5 bg-violet-900/30 text-violet-300 rounded-full border border-violet-700/30">
            Pro Feature
          </span>
        </div>
        
        <div 
          ref={aiBox} 
          className="flex flex-col gap-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-10rem)] pr-2"
        >
          {aiResponses.map((res, index) => (
            <div key={index} className="bg-slate-800/70 p-4 rounded-lg border border-violet-500/40">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-blue-600 rounded-full flex items-center justify-center">
                    <i className="ri-user-fill text-xs"></i>
                  </div>
                  <span className="text-xs text-violet-300">{res.promptUser || user.email}</span>
                </div>
                <span className="text-xs text-slate-500">{formatTime(res.timestamp)}</span>
              </div>
              
              <div className="text-sm text-violet-300 mb-3 bg-slate-800 p-2 rounded border-l-2 border-violet-500">
                <span className="block break-words whitespace-pre-wrap">{res.originalPrompt || ''}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center">
                  <i className="ri-robot-fill text-xs"></i>
                </div>
                <span className="text-xs font-medium text-blue-300">DevNest AI</span>
              </div>
              
              <div className="prose max-w-full break-words text-slate-200">
                <Markdown
                  options={{
                    overrides: {
                      pre: {
                        component: (props) => (
                          <pre className="overflow-auto max-h-64 rounded-md bg-[#1e293b] p-3 no-scrollbar" {...props} />
                        ),
                      },
                      code: {
                        component: (props) => (
                          <code className="hljs whitespace-pre no-scrollbar" {...props} />
                        ),
                      },
                    },
                  }}
                >
                  {res.message}
                </Markdown>
              </div>
              
              <div className="mt-3 flex justify-end gap-2">
                <button className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition">
                  <i className="ri-file-copy-line mr-1"></i> Copy
                </button>
                <button className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition">
                  <i className="ri-thumb-up-line mr-1"></i> Helpful
                </button>
              </div>
            </div>
          ))}
          
          {/* AI is responding indicator */}
          {isAiResponding && (
            <div className="bg-slate-800/70 p-4 rounded-lg border border-violet-500/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center">
                  <i className="ri-robot-fill text-xs"></i>
                </div>
                <span className="text-xs font-medium text-blue-300">DevNest AI</span>
              </div>
              
              <div className="flex items-center gap-2 text-violet-300 bg-slate-800 p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse delay-300"></div>
                </div>
                <span className="text-sm">Generating response...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-700 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>DevNest AI v1.5.2</span>
          </div>
        </div>
      </aside>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#1a2234] w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-700">
            <header className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <i className="ri-user-add-line text-blue-400"></i>
                <h2 className="text-lg font-semibold">Add Collaborators</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-xl text-slate-300 hover:text-red-400">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            
            <div className="mb-4">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Search users..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className={`p-3 flex items-center gap-3 rounded-lg cursor-pointer transition ${
                    selectedUserId.has(user._id) 
                      ? "bg-blue-600/20 border border-blue-500/50" 
                      : "bg-slate-800 border border-transparent hover:border-slate-600"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <span className="text-sm block">{user.email}</span>
                    <span className="text-xs text-slate-400">Developer</span>
                  </div>
                  {selectedUserId.has(user._id) && (
                    <i className="ri-check-line text-blue-400 text-lg"></i>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={addCollaborators} 
                className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                <i className="ri-user-add-line"></i>
                <span>Add Selected</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;