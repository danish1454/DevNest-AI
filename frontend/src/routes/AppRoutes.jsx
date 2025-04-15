 import React from 'react'
 import { Route, BrowserRouter, Routes } from 'react-router-dom'
 import Login from '../screen/login'
 import Register from '../screen/Register'
import Home from '../screen/Home'
import Project from '../screen/Project'

 const AppRoutes = () => {
   return (
     <BrowserRouter>

        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/project' element={<Project />} />
            
        </Routes>
     </BrowserRouter>
   )
 }
 
 export default AppRoutes