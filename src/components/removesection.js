/* removesection.js

This file allows for an interface so that the user can choose to remove
an announcement and go back to viewing just the mocksite. Mostly used for demo purposes.

*/

import React from 'react';
import './css/removesection.css';
import * as constants from './constants.js';

class RemoveSection extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick () {
		this.props.changeMode(constants.NO_ANNOUNCEMENT);
	}

	render() {
		var removeButton;

		// need to handle button changes

		removeButton = (
			<button className="btn btn-danger btn-dark remove-announcement" onClick={this.handleClick}>Remove Announcement</button>
		);

		return removeButton;
	}
}

export default RemoveSection;