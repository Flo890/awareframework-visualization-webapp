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
import Menu from '@material-ui/core/Menu';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField'


const config = require('./config.json');



class App extends Component {

	constructor(props){
		super(props);
		this.loadAvailableFeatures();
	}

	state = {
		userinfo: { // invalid data, to get a 401 response initially, which leads to the LoginView
			participantId: 0,
			participantEmail: 'notset',
			password: 'password'
		},
		isLoggedIn: undefined,
		availableFeatures: [],
		anchorEl: null,
		emailFormOpen: false
	}

	componentDidMount(){
		if(this.state.userinfo.participantEmail == 'notset'){
			this.setState({
				emailFormOpen: true
			});
		}
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
		  { this.state.isLoggedIn && this.state.userinfo.participantEmail != 'notset' ?
			  (
			  	<div>
				    <DescriptiveStatisticsContainer userinfo={this.state.userinfo} availableFeatures={this.state.availableFeatures}/>
					<TimelineContainer userinfo={this.state.userinfo} availableFeatures={this.state.availableFeatures}/>
					<NlCorrelationsContainer userinfo={this.state.userinfo}/>
				</div>
			  ):
				  (
				  	<LoginView setUserinfoFn={this.setUserinfoFn.bind(this)}/>
				  )
		  }
		  { this.state.userinfo.participantEmail == 'notset' && (<Dialog
			  open={this.state.emailFormOpen}
			  onClose={this.handleEmailFormClose}
			  aria-labelledby="form-dialog-title"
		  >
			  <DialogTitle id="form-dialog-title">E-Mail</DialogTitle>
			  <DialogContent>
				  <DialogContentText>
					  AWARE and RescueTime data is stored anonymously on the server. To connect it to the fatigue data, please enter your E-Mail address
				  </DialogContentText>
				  <TextField
					  autoFocus
					  margin="dense"
					  id="name"
					  label="Email Address"
					  type="email"
					  fullWidth
					  onChange={this.emailFormTextChange.bind(this)}
				  />
			  </DialogContent>
			  <DialogActions>
				  <Button onClick={this.handleEmailFormClose.bind(this)} color="primary">
					  Cancel
				  </Button>
				  <Button onClick={this.handleCloseSubmit.bind(this)} color="primary">
					  Submit
				  </Button>
			  </DialogActions>
		  </Dialog>)}
      </div>
    );
  }

  setUserinfoFn(participantId, email, password){
		this.setState({
			userinfo: {
				participantId: participantId,
				participantEmail: email,
				password: password
			}
		});
  }

	handleEmailFormClose(){
		this.setState({
			emailFormOpen: false
		});
	}

	handleCloseSubmit(){
		this.handleEmailFormClose();
		this.setState(prevState => {
			prevState.userinfo.participantEmail = prevState.emailFormText;
			return prevState;
		});
	}

	emailFormTextChange(event){
		let newText = event.target.value;
		this.state.emailFormText = newText
	}



}

export default App;
