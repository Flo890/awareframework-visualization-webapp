import React, { Component } from 'react';
import './App.css';
import TimelineContainer from './TimelineContainer'
import DescriptiveStatisticsContainer from './DescriptiveStatisticsContainer';
import LoginView from './LoginView';
import NlCorrelationsContainer from './NlCorrelationsContainer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';

let base64 = require('base-64');

const config = require('./config.json');



class App extends Component {

	constructor(props){
		super(props);
		this.loadAvailableFeatures();
	}

	state = {
		userinfo: {
			participantId: 3,
			participantEmail: 'Florian.Bemmann@campus.lmu.de',
			password: 'password'
		},
		isLoggedIn: undefined,
		availableFeatures: [],
		anchorEl: null
	}

	loadAvailableFeatures(){
		fetch(
			`${config.profiles[config.activeProfile].server}/features/getallavailables`,
			{
				method: 'GET'
			}
		).then(response => {
			if (response.ok) {
				console.log(`request for available features is ok`);
				this.setState({
					isLoggedIn: true
				});
				return response.json()
			} else if (response.status == 401){
				// login
				this.setState({
					isLoggedIn: false
				});
			}
		}).then(json => {
			console.log(json);

			this.setState({
				availableFeatures: json
			});
		});
	}

  render() {

	  const open = Boolean(this.state.anchorEl);

    return (
      <div className="App">
		  <AppBar position="static">
			  <Toolbar>
				  <IconButton className="menuButton" color="inherit" aria-label="Menu">
					  <MenuIcon />
				  </IconButton>
				  <Typography variant="title" color="inherit" className="grow">
					  Mimuc Fatigue Study
				  </Typography>
				  {this.state.isLoggedIn && (
					  <div>
						  <Menu
							  id="menu-appbar"
							  anchorEl={this.state.anchorEl}
							  anchorOrigin={{
								  vertical: 'top',
								  horizontal: 'right',
							  }}
							  transformOrigin={{
								  vertical: 'top',
								  horizontal: 'right',
							  }}
							  open={open}
							  onClose={this.handleClose}
						  >
						  </Menu>
					  </div>
				  )}
			  </Toolbar>
		  </AppBar>
		  { this.state.isLoggedIn ?
			  (
			  	<div>
				    <DescriptiveStatisticsContainer userinfo={this.state.userinfo} availableFeatures={this.state.availableFeatures}/>
					<TimelineContainer userinfo={this.state.userinfo} availableFeatures={this.state.availableFeatures}/>
					<NlCorrelationsContainer userinfo={this.state.userinfo}/>
				</div>
			  ):
				  (
				  	<LoginView/>
				  )
		  }
      </div>
    );
  }

}

export default App;
