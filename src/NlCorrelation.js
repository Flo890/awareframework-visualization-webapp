import React, { Component } from 'react';
import './NlCorrelation.css';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fade from '@material-ui/core/Fade';


class NlCorrelation extends Component {

	state = {
		anchorEl: null,
		hideMenuOpen: false
	}

	render(){
		const { anchorEl } = this.state;
		const hideMenuOpen = Boolean(anchorEl);

		return (
			<div>
				<Card className="correlation_card">
					<CardContent className="cardcontent">
						<Typography variant="headline" component="h2">
							{this.props.correlation.sentence}
						</Typography>
						<Typography color="textSecondary">
							significant {Math.round(this.props.correlation.correlation_coefficient*100)/100} correlation
						</Typography>
					</CardContent>
					<CardActions>
						<Button size="small">Learn More</Button>
						<Button size="small"
								aria-owns={hideMenuOpen ? 'fade-menu' : null}
								aria-haspopup="true"
								onClick={this.handleHideClick}
						>Hide</Button>
						<Menu
							id="fade-menu"
							anchorEl={this.state.anchorEl}
							open={hideMenuOpen}
							onClose={this.handleHideMenuClose}
							TransitionComponent={Fade}
						>
							<MenuItem onClick={this.handleHideMenuClose}>Hide this one</MenuItem>
							<MenuItem onClick={this.handleHideMenuClose}>Don't show correlations regarding {this.props.correlation.feature_one} in the future</MenuItem>
							<MenuItem onClick={this.handleHideMenuClose}>Don't show  correlations regarding {this.props.correlation.feature_two} in the future</MenuItem>
						</Menu>
					</CardActions>
				</Card>
			</div>
		)
	}

	handleHideClick = event => {
		this.setState({ anchorEl: event.currentTarget });
	};

	handleHideMenuClose = () => {
		this.setState({ anchorEl: null });
	};

}
export default NlCorrelation;