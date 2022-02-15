import React from 'react'
import s from './admin.module.scss'


import { Routes, Route, BrowserRouter as Router } from 'react-router-dom'
import NavigationWidget from './NavigationWidget'
import Dashboard from './screens/Dashboard'
import AnnotatorManagement from './screens/AnnotatorManagement'
import Upload from './screens/Upload'

const Admin = (): JSX.Element => {
    return <>
        <NavigationWidget />
        <div className={s.container}>
            <Routes>
                <Route index element={<Dashboard />} />
                <Route path="/annotator_management" element={<AnnotatorManagement />} />
                <Route path="/upload" element={<Upload />} />
            </Routes>
        </div>
    </>
}

export default Admin