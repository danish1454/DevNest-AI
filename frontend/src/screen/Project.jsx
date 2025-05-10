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
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const send = () => {
    if (!message.trim()) return;
    
    const outgoingMessage = {
      message,
      sender: { email: user.email },
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

  useEffect(() => {
    if (project?._id) {
      initializeSocket(project._id);

      recieveMessages('project-message', (data) => {
        if (data.sender?._id === 'ai') {
          setAiResponses((prev) => [...prev, data]);
          setIsAiResponding(false); 
        } else {
          setMessages((prevMessages) => [...prevMessages, data]);
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
    <main className="h-screen w-screen flex text-white bg-[#0f172a] font-sans">
      <aside className="w-64 bg-[#1e293b] flex flex-col border-r border-slate-700">
        {/* Sidebar Left */}
        <header className="p-4 flex justify-between items-center border-b border-slate-700">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-slate-200 hover:text-white transition">
            <i className="ri-user-add-line"></i>
            <span className="text-sm">Add</span>
          </button>
          <button onClick={() => setisSidePanelOpen(!isSidePanelOpen)} className="p-2 hover:bg-slate-800 rounded-full transition">
            <i className="ri-group-fill text-lg"></i>
          </button>
        </header>

        <div className={`absolute top-0 left-0 w-64 h-full bg-[#1e293b] shadow-md z-40 transition-transform duration-300 ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <header className="p-4 flex justify-between items-center border-b border-slate-600">
            <h1 className="text-sm font-semibold">Collaborators</h1>
            <button onClick={() => setisSidePanelOpen(false)} className="p-1 hover:text-red-500">
              <i className="ri-close-fill text-xl"></i>
            </button>
          </header>
          <div className="p-3 space-y-3">
            {project?.users?.map((user) => (
              <div key={user._id} className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-md hover:bg-slate-800 transition">
                <i className="ri-user-fill text-white bg-slate-600 p-1 rounded-full"></i>
                <span className="text-sm">{user.email}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex flex-col flex-grow relative overflow-hidden">
        <div ref={messageBox}
          className="flex-grow p-6 space-y-3 overflow-y-auto no-scrollbar bg-gradient-to-b from-slate-800 to-slate-900 max-h-[calc(100vh-8rem)] message-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-md p-3 rounded-xl break-words ${
                msg.sender?.email === user.email ? "ml-auto bg-blue-600" : "bg-slate-700"
              }`}
            >
              <small className="text-xs opacity-70 block mb-1">{msg.sender?.email}</small>
              <div className="mt-1 text-sm whitespace-pre-wrap overflow-hidden">{msg.message}</div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-3xl bg-slate-800/70 backdrop-blur-md p-3 rounded-full flex items-center gap-3 shadow-md border border-slate-700">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type your message..."
            className="flex-grow bg-transparent outline-none text-white placeholder-slate-400 px-3"
          />
          <button onClick={send} className="p-2 hover:bg-slate-700 rounded-full transition">
            <i className="ri-send-plane-2-fill text-lg"></i>
          </button>
        </div>
      </section>

      <aside className="w-96 bg-[#1e1b4b] border-l border-slate-800 p-4 hidden lg:flex flex-col">
        <h2 className="text-lg font-semibold mb-2 text-white">🤖 AI Responses</h2>
        <div ref={aiBox} className="flex flex-col gap-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-5rem)] pr-2">
          {aiResponses.map((res, index) => (
            <div key={index} className="bg-slate-800 p-3 rounded-lg border border-violet-500">
              <div className="text-sm text-violet-300 mb-2">
                <strong className="block">Prompt by {res.promptUser || user.email}</strong>
                <span className="block break-words whitespace-pre-wrap">{res.originalPrompt || ''}</span>
              </div>
              <div className="prose max-w-full break-words">
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
            </div>
          ))}
          
          {/* AI is responding indicator */}
          {isAiResponding && (
            <div className="bg-slate-800 p-3 rounded-lg border border-violet-500">
              <div className="flex items-center gap-2 text-violet-300">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse delay-300"></div>
                </div>
                <span className="text-sm">AI is responding...</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#1e293b] w-full max-w-md rounded-2xl p-6 shadow-lg border border-slate-700">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Collaborators</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-xl text-slate-300 hover:text-red-400">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className={`p-3 flex items-center gap-3 rounded-lg cursor-pointer hover:bg-slate-700 transition ${
                    selectedUserId.has(user._id) ? "bg-slate-800 ring-2 ring-blue-500" : "bg-slate-700"
                  }`}
                >
                  <i className="ri-user-line text-white text-xl"></i>
                  <span className="text-sm">{user.email}</span>
                </div>
              ))}
            </div>
            <button onClick={addCollaborators} className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition">
              Add Selected
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;