import React, { Component } from 'react';

const config = require('./config.json');

class LoginView extends Component {

	render(){
		return (
			<div className="card">
				<form action={`${config.profiles[config.activeProfile].server}/auth/login`} method="post" onSubmit={this.interceptOnSubmit}>
					<input type="text" name="participant_id" placeholder="Participant Id" min="1" />
					<input type="password" name="password" placeholder="Password" min="4" />
					<input type="email" name="email" placeholder="E-Mail" min="4" />
					<button type="submit">Log In</button>
				</form>
			</div>
		);
	}

	interceptOnSubmit(e){
		// in parallel to making the login request, set the entered data into the App component state (for later requests)
		this.props.setUserinfoFn(e.target[0].value, e.target[2].value, e.target[1].value);
	}

}
export default LoginView;