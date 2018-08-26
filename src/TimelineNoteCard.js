import React, { Component } from 'react';
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
let moment = require('moment');

class TimelineNoteCard extends Component {

	render() {
		let featureNames = this.props.note.timeline_config.selectedFeatures.map(aFeature => {return aFeature.display_name}).join(", ");
		let timelineConfigDescr = `note on ${featureNames} from ${moment.unix(this.props.note.timeline_config.fromDate/1000).format()} to ${moment.unix(this.props.note.timeline_config.toDate/1000).format()}`;
		return (
			<Card>
				<CardContent>
					<Typography color="textSecondary">
						{timelineConfigDescr}
					</Typography>
					<Typography component="p">
						{this.props.note.note_text}
					</Typography>
				</CardContent>
				{ this.props.showTimelineForConfigFunction && (
					<CardActions>
						<Button size="small" onClick={e => {this.props.showTimelineForConfigFunction(this.props.note.timeline_config)}}>show timeline for this note</Button>
					</CardActions>
				) }
			</Card>
		);
	}

}
export default TimelineNoteCard;