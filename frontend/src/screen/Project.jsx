import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Project = () => {

    const location = useLocation()
    console.log(location.state)

  return (
    <main
    className='h-screen w-screen flex'
    >

        <section className="left h-full min-w-60 bg-red-300">
        
        <header
        className='flex justify-end between items-center p-4 w-full bg-slate-200'>
        <button className='bg-slate-200 p-2 rounded-full hover:bg-slate-300'>
          <i className="ri-group-fill"></i>
        </button>
        </header>

        </section>


    </main>
  )
}

export default Project