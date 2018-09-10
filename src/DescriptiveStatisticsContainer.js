import React, { Component } from 'react';
import './DescriptiveStatisticsContainer.css';

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormLabel from '@material-ui/core/FormLabel';

import DescriptiveStatisticsLoader from './DescriptiveStatisticsLoader';
const config = require('./config.json');

let moment = require('moment');



class DescriptiveStatisticsContainer extends Component {

	accumulators = Object.freeze({
		MAX: {function:'max',displayName:'maximal'},
		AVG: {function:'avg',displayName:'average'}
	});

	state = {
		// default config, is only used on the first call when the user did not save a custom config yet
		descrStatConfigs: [

		],
		newTileDialog: {
			dialogopen: false,
			dialogDropdownOpen: false,
			dropdownValue: "",
			timespanRadiobuttonsValue: 'today',
			dialogDropdownAccMOpen: false,
			dropdownValueAccM: this.accumulators.MAX
		}
	}

	defaultConfigs = [
		{
			featureName: 'fatigue_level',
			from: undefined,
			to: undefined,
			dynamicTimerange: 'thisweek',  // means that from/to is calculated relative to the current time
			accumulator: this.accumulators.MAX
		},
		{
			featureName: 'linear_accelerometer',
			from: 1535174664000,
			to: 1535216964000,
			dynamicTimerange: false,
			accumulator: this.accumulators.AVG
		}
	];

	constructor(props){
		super(props);
		this.loadPersistedConfig(props);
	}

	loadPersistedConfig(props){
		fetch(`${config.profiles[config.activeProfile].server}/dashboardconfig`, {
			method: 'GET'
		}).then(response => {
			if (response.ok) {
				response.json().then(json => {
					console.log(`loading persisted config successful: ${json}`);
					if (json.descrStatConfigs) {
						this.setState({
							descrStatConfigs: JSON.parse(json.descrStatConfigs)
						});
					} else {
						this.setState({
							descrStatConfigs: this.defaultConfigs
						});
					}

				}).catch(jsonError => {
					console.error(`could not parse response json for loading dashboard descr stats config call`,jsonError);
				});
			}
		}).catch(fetchError => {
			console.error(`load persisted descr stats dashboard config call failed`,fetchError);
		});
	}

	render(){
		console.log('rerendering');

		return (
			<Card className="descriptive_statistics_card">
				<CardContent>
					<Typography variant="headline" component="h2">Descriptive Statistics</Typography>
				</CardContent>
				<DescriptiveStatisticsLoader descrStatConfigs={this.state.descrStatConfigs} userinfo={this.props.userinfo} handleDeleteTile={this.handleDeleteTile.bind(this)}/>

				<Button onClick={this.handleClickDialogOpen} className="add_tile_button">ADD</Button>

					<Dialog
						open={this.state.newTileDialog.dialogopen}
						onClose={this.handleDialogClose}
						aria-labelledby="form-dialog-title"
					>
						<DialogTitle id="form-dialog-title">Create a new Descriptive Statistics Tile</DialogTitle>
						<DialogContent>
							<DialogContentText>
								Please select feature, accumulation method and timespan for the new tile.
							</DialogContentText>
							<form autoComplete="off">
								<FormControl className="dropdown_feature">
									<InputLabel htmlFor="demo-controlled-open-select">Select Feature</InputLabel>
									<Select
										open={this.state.dialogDropdownOpen}
										onClose={this.handleDialogDropdownClose}
										onOpen={this.handleDialogDropdownOpen}
										value={this.state.newTileDialog.dropdownValue}
										onChange={this.handleDialogDropDownChange}
										inputProps={{
											name: 'age',
											id: 'demo-controlled-open-select',
										}}
									>
										<MenuItem value="">
											<em>None</em>
										</MenuItem>
										{this.props.availableFeatures.map(feature => {
											return <MenuItem value={feature.key}>{feature.display_name}</MenuItem>
										})}
									</Select>
								</FormControl>
								<FormControl className="dropdown_accm">
									<InputLabel htmlFor="demo-controlled-open-select">Accumulation Method</InputLabel>
									<Select
										open={this.state.dialogDropdownAccMOpen}
										onClose={this.handleDialogDropdownAccMClose}
										onOpen={this.handleDialogDropdownAccMOpen}
										value={this.state.newTileDialog.dropdownValueAccM}
										onChange={this.handleDialogDropDownChangeAccM}
										inputProps={{
											name: 'age',
											id: 'demo-controlled-open-select',
										}}
									>
										{
											Object.values(this.accumulators).map(accumulator => {
												return <MenuItem value={accumulator}>{accumulator.displayName}</MenuItem>
											})
										}
									</Select>
								</FormControl>
								<FormControl component="fieldset" className="timespan_buttons" >
									<FormLabel component="legend">Timespan</FormLabel>
									<Button onClick={()=>{this.handleDialogTimespanChange('today')}}>Today</Button>
									<Button onClick={()=>{this.handleDialogTimespanChange('yesterday')}}>Yesterday</Button>
									<Button onClick={()=>{this.handleDialogTimespanChange('thisweek')}}>This Week</Button>
									<Button onClick={()=>{this.handleDialogTimespanChange('lastweek')}}>Last Week</Button>
								</FormControl>
							</form>
							<div>
								<p>The {this.state.newTileDialog.dropdownValueAccM.displayName} {this.state.newTileDialog.dropdownValue} of {this.state.newTileDialog.timespanRadiobuttonsValue}</p>
							</div>
						</DialogContent>
						<DialogActions>
							<Button onClick={this.handleDialogCloseCancel} color="secondary">
								Cancel
							</Button>
							<Button onClick={this.handleDialogCloseAdd} color="primary">
								Add Tile
							</Button>
						</DialogActions>
					</Dialog>
			</Card>
		)
	}

	// --- dialog in general ---

	handleClickDialogOpen = () => {
		this.setState(state => {
			state.newTileDialog.dialogopen = true;
			return state;
		});
	};

	handleDialogCloseAdd = () => {

		// calculate dates
		let from = undefined;
		let to = undefined;
		let dynamicTimerange = false;
		switch(this.state.newTileDialog.timespanRadiobuttonsValue) {
			// TODO does not really make sense since the last changes
			case 'yesterday':
				dynamicTimerange = 'yesterday'
				break;
			case 'thisweek':
				dynamicTimerange = 'thisweek'
				break;
			case 'lastweek':
				dynamicTimerange = 'lastweek'
				break;
			default: // today
				dynamicTimerange = 'today'
				break;
		}



		let feature = this.state.newTileDialog.dropdownValue;

		this.setState({
			descrStatConfigs: [...this.state.descrStatConfigs, {
				featureName: feature,
				from: from ? (from.unix() * 1000) : undefined,
				to: to ? (to.unix() * 1000) : undefined,
				dynamicTimerange: dynamicTimerange,
				accumulator: this.state.newTileDialog.dropdownValueAccM
			}]
		});

		this.setState(state => {
			state.newTileDialog.dialogopen = false;
			state.newTileDialog.dropdownValue = "";
			return state;
		});

		console.log('created new tile config');
		console.log(this.state.descrStatConfigs);
	};

	handleDialogCloseCancel = () => {
		this.setState(state => {
			state.newTileDialog.dialogopen = false;
			state.newTileDialog.dropdownValue = "";
			return state;
		});
	};

	// --- timespan buttons ---

	handleDialogTimespanChange = value => {
		console.log(value);
		this.setState(state => {
			state.newTileDialog.timespanRadiobuttonsValue = value;
			return state;
		})
	}

	// --- feature dropdown ---

	handleDialogDropdownOpen = () => {
		this.setState(state => {
			state.newTileDialog.dialogDropdownOpen = true
			return state;
		});
	}

	handleDialogDropdownClose = () => {
		this.setState(state => {
			state.newTileDialog.dialogDropdownOpen = false
			return state;
		});
	}

	handleDialogDropDownChange = event => {
		console.log(event.target.value);
		this.setState(state => {
			state.newTileDialog.dropdownValue = event.target.value;
			return state;
		});
	};


	// --- accumulation method dropdown ---
	handleDialogDropdownAccMOpen = () => {
		this.setState(state => {
			state.newTileDialog.dialogDropdownAccMOpen = true
			return state;
		});
	}

	handleDialogDropdownAccMClose = () => {
		this.setState(state => {
			state.newTileDialog.dialogDropdownAccMOpen = false
			return state;
		});
	}

	handleDialogDropDownChangeAccM = event => {
		console.log(event.target.value);
		this.setState(state => {
			state.newTileDialog.dropdownValueAccM = event.target.value;
			return state;
		});
	};

	// --- delete tile ---
	handleDeleteTile(tileConfig){
		let oldConfigs = this.state.descrStatConfigs;
		for(let i = 0; i<oldConfigs.length; i++){
			if (JSON.stringify(tileConfig) == JSON.stringify(oldConfigs[i])){
				oldConfigs.splice(i,1);
				break;
			}
		}
		this.setState({
			descrStatConfigs: oldConfigs
		});
	}


}
export default DescriptiveStatisticsContainer