import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import './TimelineNotes.css';

import TimelineNoteCard from "./TimelineNoteCard";

const config = require('./config.json');

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
		fetch(`${config.profiles[config.activeProfile].server}/notes/get?type=TIMELINE`).then(json => {json.json().then(notes => {
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


		let notes = this.state.notes;

		let cards = notes
			.filter(aNote => {return !(JSON.stringify(aNote.timeline_config) == JSON.stringify(this.props.timelineConfig))})  // filter out the currently-viewed note
			.map(aNote => {
			return <TimelineNoteCard
				key={`note-${aNote.timeline_config.fromDate}-${aNote.timeline_config.toDate}-${aNote.note_text}`}
				note={aNote}
				showTimelineForConfigFunction={this.props.showTimelineForConfigFunction}/>
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
			<div className="notes_container">
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
					<h4>notes on other timeline configurations:</h4>
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

		fetch(`${config.profiles[config.activeProfile].server}/notes/save`, {
			method: 'POST',
			body: JSON.stringify({inputText: this.state.inputText, timelineConfig: this.props.timelineConfig, noteType: 'TIMELINE'}),
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