import React, { Component } from 'react';
import './DescriptiveStatisticsTile.css';

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import fatigueScaleImg from './fatigue-scale.png';

let moment = require('moment');

class DescriptiveStatisticsTile extends Component {

	state = {
		questionDialogOpen: false
	}

	render(){
		let fromMoment = moment.unix(this.props.descrStatTile.config.from/1000);
		let toMoment = moment.unix(this.props.descrStatTile.config.to/1000);

		let firstDate = fromMoment.format('MMMM Do, h:mm a');
		let minimizedDateFormat = `${fromMoment.dayOfYear() == toMoment.dayOfYear() ? '' : 'MMMM Do, '} h:mm ${fromMoment.format('a') == toMoment.format('a') ? '' : 'a'}`;
		let secondDate = toMoment.format(minimizedDateFormat);

		let dateText = `between ${firstDate} and ${secondDate}`;
		if (
			moment.unix(this.props.descrStatTile.config.from/1000).unix() == moment.unix(this.props.descrStatTile.config.from/1000).startOf('day').unix()
			&& moment.unix(this.props.descrStatTile.config.to/1000).unix() == moment.unix(this.props.descrStatTile.config.to/1000).endOf('day').unix()
		) {
			dateText  = `at ${moment.unix(this.props.descrStatTile.config.from/1000).format('MMMM Do')}`;
		}

		// show 'today', 'last week', ... if the user chose one of these
		if (this.props.descrStatTile.config.dynamicTimerange) {
			switch(this.props.descrStatTile.config.dynamicTimerange){
				case 'yesterday':
					dateText = 'Yesterday';
					break;
				case 'thisweek':
					dateText = 'This Week';
					break;
				case 'lastweek':
					dateText = 'Last Week';
					break;
				case 'today':
					dateText = 'Today';
					break;
			}
		}


		return (
			<div>
			<Card className="descr_stat_tile_card">
				<CardContent className="cardcontent">
						<div className="value_container">
							<p className="text_value">{this.props.descrStatTile.values.length == 0 || this.props.descrStatTile.values[0].value == '-' ? '-' : Math.round(this.props.descrStatTile.values[0].value*100)/100} {this.props.descrStatTile.config.displayUnit}</p>
							{this.props.descrStatTile.config.featureName == 'fatigue_level' && (<HelpOutlineIcon onClick={()=>{this.handleQuestionIconClick(this.props.descrStatTile.config)}}/>)}
						</div>
						<div className="label_container">
							<p className="label">{this.props.descrStatTile.config.accumulator.displayName} {this.props.descrStatTile.featureDisplayName}</p>
						</div>
						<Typography className="text_time">
							{dateText}
							{(this.props.descrStatTile.values.length > 0 && this.props.descrStatTile.values[0].timestamp) ? `, reached at ${moment.unix(this.props.descrStatTile.values[0].timestamp/1000).format(minimizedDateFormat)}`:''}
						</Typography>
					<DeleteIcon className="delete_icon" onClick={()=>{this.props.handleDeleteTile(this.props.descrStatTile.config)}}/>
				</CardContent>
			</Card>
				{ this.props.descrStatTile.config.featureName == 'fatigue_level' && (
					<Dialog
						open={this.state.questionDialogOpen}
						onClose={this.handleQuestionDialogClose.bind(this)}
						aria-labelledby="form-dialog-title"
					>
						<DialogTitle id="form-dialog-title">Fatigue Level</DialogTitle>
						<DialogContent>
							<DialogContentText>
								Your mental fatigue is presented by the USAFSAM Mental Fatigue Scale:
							</DialogContentText>
							<figure><img src={fatigueScaleImg} /></figure>
						</DialogContent>
						<DialogActions>
							<Button onClick={this.handleQuestionDialogClose.bind(this)} color="primary">
								Close
							</Button>
						</DialogActions>
					</Dialog>)
				}
			</div>
		);
	}

	handleQuestionIconClick(){
		this.setState({
			questionDialogOpen: true
		});
	}

	handleQuestionDialogClose(){
		this.setState({
			questionDialogOpen: false
		});
	}



}
export default DescriptiveStatisticsTile;