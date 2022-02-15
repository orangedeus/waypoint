import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Header from '../components/Header'
import Footer from '../components/Footer'

import Home from './Home'
import Map from './Map'
import Annotation from './Annotation'

import Login from "./LogIn"

import { loggingInState, authState } from '../stores/auth'
import { useRecoilState } from "recoil"

import NotFound from "./NotFound";
import Admin from "./Admin";
import Dashboard from "./Admin/screens/Dashboard";
import AnnotatorManagement from "./Admin/screens/AnnotatorManagement";
import Upload from "./Admin/screens/Upload";

const Index = () => {
    const [loggingIn,] = useRecoilState(loggingInState)
    const [auth, setAuth] = useRecoilState(authState)

    useEffect(() => {
        const prevAuth = localStorage.getItem('auth')
        if (prevAuth !== null) {
            setAuth(JSON.parse(prevAuth))
        }
    }, [])

    return (
        <Router>
            <div className="container">
                {loggingIn && <Login />}
                <Header />
                <Routes>
                    <Route path="/">
                        <Route index element={<Home />} />
                        <Route path="map" element={<Map />} />
                        {Boolean(auth.user) && <Route path="annotation" element={<Annotation />} />}
                        {Boolean(auth.admin) && <Route path="admin" element={<Admin />}>
                            <Route index element={<Dashboard />} />
                            <Route path="/admin/annotator_management" element={<AnnotatorManagement />} />
                            <Route path="/admin/upload" element={<Upload />} /> 
                        </Route>}
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
                <Footer />
            </div>
        </Router>
    )
}

export default Index