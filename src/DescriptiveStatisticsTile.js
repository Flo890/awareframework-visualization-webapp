import React, { Component } from 'react';
import './DescriptiveStatisticsTile.css';

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete';

let moment = require('moment');

class DescriptiveStatisticsTile extends Component {

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

		return (
			<Card className="descr_stat_tile_card">
				<CardContent className="cardcontent">

						<div className="value_container">
							<p className="text_value">{this.props.descrStatTile.values.length == 0 ? '-' : Math.round(this.props.descrStatTile.values[0].value*100)/100}</p><p className="text_unit"> {this.props.descrStatTile.unit}</p>
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
		);
	}



}
export default DescriptiveStatisticsTile;