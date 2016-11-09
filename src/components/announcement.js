import React from "react";
import Content from "./content.js";
import * as constants from './constants.js';
import './link.css';

class Announcement extends React.Component {
	render () {
		var image = this.props.data.image;

		// in-line styling to display background image
		var announcementStyle = {
			'padding': '10px',
			'backgroundImage': 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(' + image + ')',		
			'backgroundRepeat': 'no-repeat',
			'backgroundSize': 'cover'
		};

		// scheduling data
		var start = new Date(this.props.data.startDate);
		var end = new Date(this.props.data.endDate);
		var current = new Date();
		var displayAnnouncement = false;

		// display announcement on edit mode, when no dates specified,
		// and when the current date falls within the scheduled date
		if ( this.props.mode == constants.EDIT || 
			(start < current && current < end) || 
			(start == constants.INVALID_DATE && end == constants.INVALID_DATE) ||
			(start == constants.INVALID_DATE && end != constants.INVALID_DATE && current < end) ||
			(start != constants.INVALID_DATE && end == constants.INVALID_DATE && start < current) ) {
			displayAnnouncement = true;
		} 

		// show announcement depending on scheduled date and mode
		// and when no start and no end is given
		if (displayAnnouncement) {
			var announcement = (
				<a href={this.props.data.link}>
					<div className="announcement" style={announcementStyle}>
							<Content data={this.props.data} />
					</div>
				</a>
			);
		} else {
			var announcement = <noscript/>;
		}

		// debugging
		console.log("Start: " + start);
		console.log("End: " + end);
		console.log("Current: " + current);
		console.log("Display: " + displayAnnouncement);
		console.log("\n");

		return announcement;
	}
}

export default Announcement;