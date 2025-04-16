import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, recieveMessages, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';


const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message,  setMessage] = useState('')
  const { user } = useContext(UserContext)


  const [users, setUsers] = useState([])

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

  function  addCollaborators() {
    axios.put('/projects/add-user',{
      projectId: location.state.project._id,
      users: Array.from(selectedUserId)
    }).then(res => {
      console.log(res.data)
      setIsModalOpen(false)
      // setSelectedUserId([])
    }).catch(err => {
      console.error(err)
    })
  }

  const send = () =>{
      sendMessage('project-message', { 
        message,
        sender: user._id
       })

       setMessage("")
  }

  useEffect(() => {

    initializeSocket(project._id);

    recieveMessages('project-message', data => {
      console.log(data)
    })

    

    axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
      setProject(res.data.project)
    })

    axios.get('/users/all').then(res => {
        setUsers(res.data.users)
      }).catch(err => {
        console.error(err)
    })
  }, [])

  return (
    <main className='h-screen w-screen flex'>
      <section className='left relative flex flex-col h-full min-w-72 bg-slate-300'>
        {/* Header */}
        <header className='flex justify-between items-center p-3.5 w-full bg-slate-200 z-10'>
          {/* Left button — opens modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className='flex gap-2 items-center'
          >
            <i className='ri-user-add-fill'></i>
            <p>Add collaborator</p>
          </button>

          {/* Right button — opens sliding panel */}
          <button
            onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
            className='p-2'
          >
            <i className='ri-group-fill'></i>
          </button>
        </header>

        {/* Chat area */}
        <div className='conversation-area flex-grow flex flex-col p-4'>
          <div className='message-box p-1 flex-grow flex flex-col gap-1.5'>
            <div className='message max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-lg'>
              <small className='opacity-65 text-xs'>example@gmail.com</small>
              <p className='text-sm'>Lorem ipsum dolor sit amet.</p>
            </div>

            <div className='ml-auto max-w-56 message flex flex-col p-2 bg-slate-50 w-fit rounded-lg'>
              <small className='opacity-65 text-xs'>example@gmail.com</small>
              <p className='text-sm'>Lorem ipsum dolor sit amet.</p>
            </div>
          </div>

          {/* Input */}
          <div className='inputField w-full flex items-center gap-2 mt-3'>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='flex-grow p-2 px-4 rounded-full bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition'
              type='text'
              placeholder='Enter message'
            />
            <button
            onClick={send}
            className='p-3 rounded-full bg-slate-600 text-white hover:bg-slate-700 transition-colors'>
              <i className='ri-send-plane-fill'></i>
            </button>
          </div>
        </div>

        {/* Slide Panel */}
        <div
          className={`sidePanel absolute top-0 left-0 h-full w-full max-w-xs bg-slate-100 shadow-lg transform transition-transform duration-300 z-20 ${
            isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <header className='flex justify-between items-center p-4 bg-slate-200'>

            <h1 className='font-semibold text-lg'>Collaborators</h1>
            <button
              onClick={() => setisSidePanelOpen(false)}
              className='p-2'
            >
              <i className='ri-close-fill'></i>
            </button>
          </header>

          <div className='users flex flex-col gap-2 p-4'>

            {project.users && project.users.map((user) => {

              return (
                  <div className='user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center'>
                    <div className='w-7 h-7 rounded-full flex items-center justify-center p-1 text-white bg-slate-600'>
                      <i className='ri-user-fill'></i>
                    </div>
                    <h1 className='font-semibold'>{user.email}</h1>
                </div>  
              )

            })}
          </div>
        </div>

        {/* Modal for "Add Collaborator" */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white/70 backdrop-blur-md w-full max-w-md rounded-2xl shadow-xl border border-slate-200 ring-1 ring-slate-300/20 flex flex-col relative">

              {/* Header */}
              <header className="flex justify-between items-center p-5 border-b border-slate-300/40 bg-white/60 rounded-t-2xl">
                <h2 className="text-xl font-semibold text-slate-800">Select Collaborators</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-2xl text-slate-600 hover:text-slate-800 transition"
                >
                  <i className="ri-close-line"></i>
                </button>
              </header>

              {/* Scrollable User List */}
              <div className="users flex flex-col gap-3 p-4 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserClick(user._id)}
                    className={`cursor-pointer p-3 px-4 rounded-xl flex items-center gap-3 border border-slate-200/70 bg-white/50 shadow-sm hover:shadow-md hover:bg-white transition 
                    ${
                      Array.from(selectedUserId).includes(user._id)
                        ? 'bg-slate-100 ring-2 ring-slate-400/50'
                        : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-700 text-white text-lg">
                      <i className="ri-user-fill"></i>
                    </div>
                    <span className="font-medium text-slate-800">{user.email}</span>
                  </div>
                ))}
              </div>

              {/* Fixed Bottom Button */}
              <div className="p-4 border-t border-slate-300/40 bg-white/60 rounded-b-2xl">
                <button
                  className="w-full px-6 py-3 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition shadow-md"
                  onClick={addCollaborators} 
                >
                  Add Collaborators
                </button>
              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
};

export default Project;
