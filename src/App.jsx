import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Browser from './pages/Browser';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/browse' element={<Browser />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
