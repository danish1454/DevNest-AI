import React, {useContext, useState} from 'react'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const Home = () => {

  const {user} = useContext(UserContext);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [projectName, setProjectName] = useState(null)


  function createProject(e){
    e.preventDefault()
    console.log({projectName})

    axios.post('/projects/create', {
      name : projectName,
  })
      .then((res) => {
        console.log(res)
        setIsModelOpen(false)
      })
      .catch((err) => {
        console.log(err);
      })
    }

  return (
    <main className='p-4'>

          <div className='projects'>
              <button 
              
              onClick={() => setIsModelOpen(true)}
              className="project p-4 border border-slate-300 rounded-md">
              New Project
              <i className="ri-link ml-2"></i>
              </button>
          </div>

          {isModelOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
                <form
                  onSubmit={createProject}>
                  <div className="mb-4">
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                      Project Name
                    </label>
                    <input
                    onChange={(e) => setProjectName(e.target.value)}
                      value={projectName}
                      type="text"
                      id="projectName"
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      onClick={() => setIsModelOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

    </main>
  )
}

export default Home