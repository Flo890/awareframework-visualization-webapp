import React, { Component } from 'react';
import './DescriptiveStatisticsContainer.css';

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
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

let moment = require('moment');



class DescriptiveStatisticsContainer extends Component {

	accumulators = Object.freeze({
		MAX: {function:'max',displayName:'maximal'},
		AVG: {function:'avg',displayName:'average'}
	});

	state = {
		descrStatConfigs: [
			{
				featureName: 'fatigue_level',
				from: 1535174664000,
				to: 1535216964000,
				accumulator: this.accumulators.MAX
			},
			{
				featureName: 'linear_accelerometer',
				from: 1535174664000,
				to: 1535216964000,
				accumulator: this.accumulators.AVG
			}
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

	render(){
		console.log('rerendering');

		return (
			<Card className="descriptive_statistics_card">
				<CardContent>
					<Typography variant="headline" component="h2">Descriptive Statistics</Typography>
				</CardContent>
				<DescriptiveStatisticsLoader descrStatConfigs={this.state.descrStatConfigs} participantId={this.props.participantId} participantEmail={this.props.participantEmail} handleDeleteTile={this.handleDeleteTile.bind(this)}/>

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
		let from = 0;
		let to = 0;
		switch(this.state.newTileDialog.timespanRadiobuttonsValue) {
			case 'yesterday':
				from = moment().subtract(1, 'day').startOf('day');
				to = moment().subtract(1, 'day').endOf('day');
				break;
			case 'thisweek':
				from = moment().startOf('week');
				to = moment().endOf('week');
				break;
			case 'lastweek':
				from = moment().subtract(1, 'week').startOf('week');
				to = moment().subtract(1, 'week').endOf('week');
				break;
			default: // today
				from = moment().startOf('day');
				to = moment().endOf('day');
				break;
		}



		let feature = this.state.newTileDialog.dropdownValue;

		this.setState({
			descrStatConfigs: [...this.state.descrStatConfigs, {
				featureName: feature,
				from: from.unix() * 1000,
				to: to.unix() * 1000,
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