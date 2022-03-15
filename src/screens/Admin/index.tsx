import React from 'react'
import s from './admin.module.scss'


import { Routes, Route, BrowserRouter as Router } from 'react-router-dom'
import NavigationWidget from './NavigationWidget'
import Dashboard from './screens/Dashboard'
import AnnotatorManagement from './screens/AnnotatorManagement'
import Upload from './screens/Upload'
import Data from './screens/Data'
import Settings from './screens/Settings'

const Admin = (): JSX.Element => {
    return <>
        <NavigationWidget />
        <div className={s.container}>
            <Routes>
                <Route index element={<Dashboard />} />
                <Route path="/annotator_management" element={<AnnotatorManagement />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/data" element={<Data />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </div>
    </>
}

export default Admin