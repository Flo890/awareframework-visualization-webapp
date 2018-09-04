import React, { Component } from 'react';

const config = require('./config.json');

class LoginView extends Component {

	state = {
		participantIdField: undefined,
		passwordField: undefined
	}

	render(){
		return (
			<div className="card">
				<form action={`${config.profiles[config.activeProfile].server}/auth/login`} method="post">
					<input type="text" name="participant_id" placeholder="Participant Id" min="1" />
					<input type="password" name="password" placeholder="Password" min="4" />
					<button type="submit">Log In</button>
				</form>

				<div className="spaced">
					<a href="register.html">Register now.</a>
				</div>
			</div>
		);
	}


}
export default LoginView;