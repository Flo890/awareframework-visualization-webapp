import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import TimelineNoteCard from "./TimelineNoteCard";

class TimelineNotes extends Component {

	state = {
		inputText: '',
		notes: []
	};

	constructor(props) {
		super(props);
		this.loadNotes();
	}

	loadNotes(){
		fetch(`${require('./config.json').server}/notes/get`).then(json => {json.json().then(notes => {
			for(let i = 0; i<notes.length; i++){
				notes[i].timeline_config = JSON.parse(notes[i].timeline_config);
			}
			this.setState({
				notes: notes
			});
		}).catch(jsonError => {
			console.error(`parsing notes json failed`,jsonError);
		})}).catch(error => {
			console.error(`fetching notes failed`,error);
		});
	}

	render(){

		// demo data
		// let notes = [{
		// 	note_text: "this is an awesome insight!",
		// 	timeline_config: {
		// 		fromDate: 1535046919131,
		// 		toDate: 1535187482902,
		// 		selectedFeatures: [
		// 			{key: "temperature", display_name: "outside temperature"},
		// 			{key: "ambient_noise_plugin", display_name: "ambient noise (plugin)"},
		// 			{key: "fatigue_level", display_name: "fatigue level"}
		// 		]
		// 	}
		// },
		// 	{
		// 		note_text: "Wow is this tool awesome <3",
		// 		timeline_config: {
		// 			fromDate: 1535046919131,
		// 			toDate: 1535187482902,
		// 			selectedFeatures: [
		// 				{key:"linear_accelerometer",display_name:"phone movement"},
		// 				{key:"fatigue_level",display_name:"fatigue level"}
		// 			]
		// 		}
		// 	}
		// ];


		let notes = this.state.notes;

		let cards = notes
			.filter(aNote => {return !(JSON.stringify(aNote.timeline_config) == JSON.stringify(this.props.timelineConfig))})  // filter out the currently-viewed note
			.map(aNote => {
			return <TimelineNoteCard note={aNote} showTimelineForConfigFunction={this.props.showTimelineForConfigFunction}/>
		});

		let noteForCurrTimelineConfig = undefined;
		notes.forEach(aNote => {
			if (JSON.stringify(aNote.timeline_config) == JSON.stringify(this.props.timelineConfig)) {
				noteForCurrTimelineConfig = (
					<div>
						<h4>note on this timeline configuration:</h4>
						<TimelineNoteCard note={aNote} />
					</div>
				)
			}
		});


		return (
			<div>
				{
					noteForCurrTimelineConfig
				}
				<form onSubmit={this.handleSubmit.bind(this)}>
					<TextField
						multiline={true}
						placeholder="space for your notes on this particular timeline"
						rows={2}
						fullWidth={true}
						onChange={this.handleInputChange.bind(this)}
						value={this.state.inputText}
					/>
					<Button type="submit">Save note</Button>
				</form>
				<div>
					<h4>other notes:</h4>
					{cards}
				</div>

			</div>
		);
	}

	handleSubmit(event) {
		event.preventDefault();

		if(!this.state.inputText){
			alert('please type a note first');
			return;
		}

		fetch(`${require('./config.json').server}/notes/save`, {
			method: 'POST',
			body: JSON.stringify({inputText: this.state.inputText, timelineConfig: this.props.timelineConfig}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(res => {
			// update displayed notes
			this.loadNotes();
			// clear input
			this.setState({
				inputText: ''
			});
		}).catch(error => {
			console.error('uploading note failed',error);
		});
	}

	handleInputChange = (event) => {
		this.setState({inputText: event.target.value});
	}

}
export default TimelineNotes;