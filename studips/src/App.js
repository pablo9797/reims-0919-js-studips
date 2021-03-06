import React, { useState } from 'react';
import MainThread from './component/MainThread';
import './App.css';
import RegisterForm from './component/RegisterForm';
import LoginForm from './component/LoginForm';
import Welcome from './component/Welcome';
import { Switch, Route } from 'react-router-dom';
import Parameter from './component/Parameter';
import Profil from './component/Profil';
import ProfilCard from './component/ProfilCard'

function App() {
	const [token, setToken] = useState(null);
	return (
		<div className='App'>
			<Switch>
				<Route exact path='/'>
					<Welcome />
				</Route>
				<Route path='/login'>
					<LoginForm token={token} setToken={setToken} />
				</Route>
				<Route path='/register'>
					<RegisterForm />
				</Route>
				<Route path='/mainthread'>
					<MainThread token={token} />
				</Route>
				<Route path='/parameter'>
					<Parameter token={token} />
				</Route>
				<Route path='/profil' render={(props) => (
					<Profil 
					{...props}
					token={token}
					/>
					
				)} />
				<Route path='/profilCard' render={(props) => (
					<ProfilCard 
					{...props}
					token={token}
					/>
					
				)} />
			</Switch>
		</div>
	);
}

export default App;
