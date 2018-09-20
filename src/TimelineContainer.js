import React, { Component } from 'react';
import './TimelineContainer.css';
import TimelineLoader from './TimelineLoader';
import DateTimePicker from 'react-datetime-picker'
import Chip from '@material-ui/core/Chip'
import AddIcon from '@material-ui/icons/Add'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import ColorHash from "color-hash";
import TimelineNotes from "./TimelineNotes";
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField'

const EventEmitter = require('wolfy87-eventemitter');
let moment = require('moment');
const config = require('./config.json');
const granularitySteps = [5,10,15,30,60,60*3,60*24];

class TimelineContainer extends Component {

	constructor(props) {
		super(props);
		this.loadPersistedConfig();
		this.state = {
			userconfig: {

			},
			timesegmentNoteDialog: {
				dialogopen: false,
				dateFrom: undefined,
				dateTo: undefined,
				noteText: ''
			}
		}
		this.timelineLoader = React.createRef();
	}

	defaultUserconfig = {
			timeline: {
				fromDate: moment().subtract(1,'days').startOf('day').unix()*1000,
				toDate: moment().unix()*1000,
				selectedFeatures: [
					{key:"temperature",display_name:"outside temperature"},
					{key:"ambient_noise_plugin",display_name:"ambient noise (plugin)"},
					{key:"fatigue_level",display_name:"fatigue level"}
				],
				granularityMins: 60
			}
	}

	componentDidMount(){
		window.addEventListener('correlation-learnmore-clicked', this.handleCorrelationLearnMoreEvent.bind(this));
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

		if (!this.state.userconfig.timeline) {
			// if config not loaded yet, render something empty instead
			return (
				<div>
					<Card className="timeline_card">
						<CardContent>
						</CardContent>
					</Card>
				</div>
			);
		}

		return (
			<div className="timeline_container">
				<Typography variant="headline" component="h1">Timeline</Typography>
				<Card className="timeline_card">
					<CardContent>
						<TimelineLoader
							userconfig={this.state.userconfig.timeline}
							selectedFeatures={this.state.userconfig.timeline.selectedFeatures}
							userinfo={this.props.userinfo}
							timelineContainerRef={this}
							ref={this.timelineLoader}
						/>
						<table>
							<tr>
								<td>
									<h4>time range</h4>
								</td>
								<td>
									<div className="range_choosers">
										<p>from <DateTimePicker
											onChange={this.onDateFromChange}
											value={new Date(this.state.userconfig.timeline.fromDate)}
										/>  to <DateTimePicker
											onChange={this.onDateToChange}
											value={new Date(this.state.userconfig.timeline.toDate)}
										/>
										</p>
									</div>
								</td>
							</tr>
							<tr>
								<td>
									<h4>displayed features</h4>
								</td>
								<td>
									<div className="feature_chooser">

										{
											this.props.availableFeatures.map(feature => {
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
															className="feature_chip"
															label={feature.display_name}
															onDelete={this.handleFeatureUnselect.bind({key:feature.key,realThis: this})}
															style={{background:colorHash.hex(feature.key)}}
														/>
													)
												} else {
													// chip for not selected feature
													return (
														<Chip
															className="feature_chip"
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
								</td>
							</tr>
							<tr>
								<td>
									<h4>data frequency</h4>
								</td>
								<td>
									<div>
										<Slider
											onChange={this.handleGranularitySlider.bind(this)}
											defaultValue={6}
											min={0}
											max={granularitySteps.length-1}
											marks={granularitySteps.reduce(
												(map,obj,index)=>{
													map[index] =  obj < 60 ? `${obj}m` : (obj < 1440 ? `${obj/60}h`: `${obj/(24*60)}d`);
													return map;
												}
												,{}
											)}
										/>
									</div>
								</td>
							</tr>
						</table>


						<TimelineNotes
							participantId={this.props.participantId}
							timelineConfig={this.state.userconfig.timeline}
							showTimelineForConfigFunction={this.showTimelineForConfig.bind(this)}
						/>
					</CardContent>
				</Card>



				<Dialog
					open={this.state.timesegmentNoteDialog.dialogopen}
					onClose={this.handleDialogClose}
					aria-labelledby="form-dialog-title"
				>
					<DialogTitle id="form-dialog-title">Add note for time segment</DialogTitle>
					<DialogContent>
						<DialogContentText>
							TODO a text
						</DialogContentText>
						<form autoComplete="off">
							<FormControl className="dropdown_accm">
								<InputLabel htmlFor="demo-controlled-open-select">your note</InputLabel>
									<TextField
										fullWidth={true}
										onChange={this.onTimesegmentNoteTextChange.bind(this)}
										value={this.state.timesegmentNoteDialog.noteText}
									/>

							</FormControl>
							<FormControl component="fieldset" className="timespan_buttons" >
								<FormLabel component="legend">Timespan from</FormLabel>
								<DateTimePicker
									onChange={this.onTimesegmentNoteDateFromChange}
									value={new Date(this.state.timesegmentNoteDialog.dateFrom*1000)}
								/>
							</FormControl>
							<FormControl component="fieldset" className="timespan_buttons" >
								<FormLabel component="legend">Timespan to</FormLabel>
								<DateTimePicker
									onChange={this.onTimesegmentNoteDateToChange}
									value={new Date(this.state.timesegmentNoteDialog.dateTo*1000)}
								/>
							</FormControl>
						</form>
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
		for(let i = 0; i<this.realThis.props.availableFeatures.length; i++){
			if(this.realThis.props.availableFeatures[i].key == this.key){
				selectedFeatureObj = this.realThis.props.availableFeatures[i];
				break;
			}
		}

		this.realThis.setState(prevState => {
			prevState.userconfig.timeline.selectedFeatures.push(selectedFeatureObj);
			return prevState;
		});
	}

	showTimelineForConfig(timelineConfig){
		this.setState(prevState => {
			prevState.userconfig.timeline = timelineConfig;
			return prevState;
		});
	}

	loadPersistedConfig(props){
		fetch(`${config.profiles[config.activeProfile].server}/dashboardconfig`, {
			method: 'GET'
		}).then(response => {
			if (response.ok) {
				response.json().then(json => {
					console.log(`loading persisted timeline config successful: ${json}`);
					if (json.timelineConfigs) {
						this.setState({
							userconfig: {timeline: JSON.parse(json.timelineConfigs)}
						});
					} else {
						this.setState({
							userconfig: this.defaultUserconfig
						});
					}
				}).catch(jsonError => {
					console.error(`could not parse response json for loading dashboard timeline config call`,jsonError);
				});
			}
		}).catch(fetchError => {
			console.error(`load persisted timeline dashboard config call failed`,fetchError);
		});
	}

	handleGranularitySlider(value) {
			this.setState(prevState => {
				prevState.userconfig.timeline.granularityMins = granularitySteps[value];
				return prevState;
			});
	}

	// ------------- timespan dialog ----------------

	// called in TimelineVis
	showTimesegmentNoteAddDialog(timelineContainerRef, clickedDatetime){
		timelineContainerRef.setState(prevState => {
			prevState.timesegmentNoteDialog.dialogopen = true;
			prevState.timesegmentNoteDialog.dateFrom = moment(clickedDatetime).unix();
			prevState.timesegmentNoteDialog.dateTo = moment(clickedDatetime).add(1,'hours').unix();
			return prevState;
		});
	}

	onTimesegmentNoteDateFromChange = date => {
		this.setState(prevState => {
			prevState.timesegmentNoteDialog.dateFrom = date.getTime()/1000;
			return prevState;
		});
		console.log(`from set to ${date}`);
	};

	onTimesegmentNoteDateToChange = date => {
		this.setState(prevState => {
			prevState.timesegmentNoteDialog.dateTo = date.getTime()/1000;
			return prevState;
		});
		console.log(`from set to ${date}`);
	};

	onTimesegmentNoteTextChange = (event) => {
		let newText = event.target.value;
			this.setState(prevState => {
				prevState.timesegmentNoteDialog.noteText = newText;
				return prevState;
			});
			console.log(`note text set to ${newText}`);
	}

	handleDialogCloseCancel = () => {
		this.setState(state => {
			state.timesegmentNoteDialog.dialogopen = false;
			return state;
		});
	};

	handleDialogCloseAdd = () => {
		this.setState(state => {
			state.timesegmentNoteDialog.dialogopen = false;
			return state;
		});
		this.timelineLoader.current.createNewTimesegmentNote(this.state.timesegmentNoteDialog);
	};

	handleCorrelationLearnMoreEvent(e){
		let correlation = e.detail;

		let newTimelineConfig = {
			fromDate: correlation.from,
			toDate: correlation.to,
			selectedFeatures: [
				...this.props.availableFeatures.filter(feature => feature.key == correlation.feature_one),
				...this.props.availableFeatures.filter(feature => feature.key == correlation.feature_two)
			],
			maxValues: this.defaultUserconfig.timeline.maxValues
		};

		this.setState(prevState => {
			prevState.userconfig.timeline = newTimelineConfig;
			return prevState;
		});
	}

}

export default TimelineContainer;