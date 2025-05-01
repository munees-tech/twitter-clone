import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from "./pages/auth/signup/signUpPage";
import LoginPage from './pages/auth/login/LoginPage';
import HomePage from './pages/auth/home/HomePage';
import Sidebar from "../src/components/commen/Sidebar";
import RightPanal from "./components/commen/RightPanal";
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import { useQuery } from '@tanstack/react-query';
import { base_url } from './components/constant/url';
import LoadingSpinner from './components/commen/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

const App = () => {
		const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
					const res = await fetch(`${base_url}/api/auth/me`, {
					method :"GET",
					credentials: 'include',
					headers : {
						"Content-Type" : "application/json"
					}
				});
				const data = await res.json();
				console.log(authUser)
				if (data.error);
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		}
	});
	


	if (!authUser) return null;

	return (
		<div className='flex max-w-6xl mx-auto'>
			{/* Common component, because it's not wrapped with Routes */}
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
			</Routes>
			{authUser && <RightPanal />}
			<Toaster />
		</div>
	);
};

export default App;