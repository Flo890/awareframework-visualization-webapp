import React, { Component } from 'react';

class DescriptiveStatisticsEditDialog extends Component {

	state = {

	}

	render(){
		return (
				<Dialog
					open={this.state.open}
					onClose={this.handleClose}
					aria-labelledby="form-dialog-title"
				>
					<DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
					<DialogContent>
						<DialogContentText>
							To subscribe to this website, please enter your email address here. We will send
							updates occasionally.
						</DialogContentText>
						<TextField
							autoFocus
							margin="dense"
							id="name"
							label="Email Address"
							type="email"
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleClose} color="primary">
							Cancel
						</Button>
						<Button onClick={this.handleClose} color="primary">
							Subscribe
						</Button>
					</DialogActions>
				</Dialog>
		);
	}

}
export default DescriptiveStatisticsEditDialog