import React, { Component } from 'react';
import TimelineLoader from './TimelineLoader';
import DateTimePicker from 'react-datetime-picker'
import Chip from '@material-ui/core/Chip'
import AddIcon from '@material-ui/icons/Add'
import ColorHash from "color-hash";
let base64 = require('base-64');



class TimelineContainer extends Component {

	constructor(props) {
		super(props);
		this.state = {
			userconfig: {
				timeline: {
					fromDate: 1533041083731,//1533877920000,
					toDate: 1533101406924,//1533921120000,
					selectedFeatures: [
						{key:"temperature",display_name:"outside temperature"},
						{key:"ambient_noise_plugin",display_name:"ambient noise (plugin)"},
						{key:"fatigue_level",display_name:"fatigue level"}
					]
				}
			},
			availableFeatures: [] // loaded immediately from backend
		}
		this.loadAvailableFeatures();
	}

	loadAvailableFeatures(){
		let participantId = 2; // TODO
		fetch(
			`http://localhost:8080/application/endpoints/getavailablefeatures.php?&participant_id=${participantId}`,
			{
				method: 'GET',
				headers: {
					'Authorization': 'Basic ' + base64.encode(participantId + ":" + 'password') // TODO
				}
			}
		).then(response => {
			if (response.ok) {
				console.log(`request for available features is ok`);
				return response.json()
			} else if (response.status == 401){
				// login
				alert('password wrong!'); // TODO
			}
		}).then(json => {
			console.log(json);

			this.setState({
				availableFeatures: json
			});
		});
	}


	onDateFromChange = date => {
		this.setState(prevState => {
			prevState.userconfig.timeline.fromDate = date.getTime();
			return prevState;
		});
		console.log(`from set to ${date}`);
	};

	onDateToChange = date => {
		this.setState(prevState => {
			prevState.userconfig.timeline.toDate = date.getTime();
			return prevState;
		});
		console.log(`to set to ${date}`);
	};

	render() {
		let colorHash = new ColorHash();
		return (
			<div>
				<TimelineLoader
					userconfig={this.state.userconfig.timeline}
					selectedFeatures={this.state.userconfig.timeline.selectedFeatures}
					/>
				<div className="range_choosers">
					<DateTimePicker
						onChange={this.onDateFromChange}
						value={new Date(this.state.userconfig.timeline.fromDate)}
					/>
					<DateTimePicker
						onChange={this.onDateToChange}
						value={new Date(this.state.userconfig.timeline.toDate)}
					/>
				</div>
				<div className="feature_chooser">
					{
						this.state.availableFeatures.map(feature => {
							let isSelected = false;
							for(let i=0; i<this.state.userconfig.timeline.selectedFeatures.length; i++){
								if (this.state.userconfig.timeline.selectedFeatures[i].key == feature.key){
									isSelected = true;
									break;
								}
							}
							if (isSelected){
								// chip for selected feature
								return (
									<Chip
										label={feature.display_name}
										onDelete={this.handleFeatureUnselect.bind({key:feature.key,realThis: this})}
										style={{background:colorHash.hex(feature.key)}}
									/>
								)
							} else {
								// chip for not selected feature
								return (
									<Chip
										label={feature.display_name}
										clickable
										onDelete={this.handleFeatureSelect.bind({key:feature.key,realThis: this})}
										deleteIcon={<AddIcon />}
									/>
								)
							}

						})
					}
				</div>
			</div>
		);
	}

	handleFeatureUnselect(){
		console.log(`unselected ${this.key}`);
		for(let i = 0; i<this.realThis.state.userconfig.timeline.selectedFeatures.length; i++){
			if(this.realThis.state.userconfig.timeline.selectedFeatures[i].key == this.key){
				this.realThis.setState(prevState => {
					prevState.userconfig.timeline.selectedFeatures.splice(i,1);
					return prevState;
				});
				break;
			}
		}
	}

	handleFeatureSelect(){
		console.log(`selected ${this.key}`);
		// get full feature object
		let selectedFeatureObj;
		for(let i = 0; i<this.realThis.state.availableFeatures.length; i++){
			if(this.realThis.state.availableFeatures[i].key == this.key){
				selectedFeatureObj = this.realThis.state.availableFeatures[i];
				break;
			}
		}

		this.realThis.setState(prevState => {
			prevState.userconfig.timeline.selectedFeatures.push(selectedFeatureObj);
			return prevState;
		});
	}





}

export default TimelineContainer;