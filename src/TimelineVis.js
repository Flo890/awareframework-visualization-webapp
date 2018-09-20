import React, { Component } from 'react';
import {Group} from '@vx/group';
import {LinePath, Line, BarGroup} from '@vx/shape';
import {scaleTime, scaleLinear, scaleBand, scaleOrdinal } from '@vx/scale';
import {extent,max,bisector} from 'd3-array';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { curveNatural, curveStepAfter, curveStep } from '@vx/curve';

let moment = require('moment');

class TimelineVis extends Component {
	state = {
		position: null, // position of the context line. If not null, the line will be displayed
		positionDate: null
	};
	render(){

		let useBars = this.props.queryGranularity == 1440; // show bar graph for daily data granularity, timeline otherwise

		console.log('TimelineVis.render()');

		let datasets = this.props.datasets;
		let keys = Object.keys(datasets);
		if (keys.length == 0){
			return '<p>please wait...</p>';
		}



		// some sizing parameters
		const width = 1000;
		const height = 500;
		const margin = {
			top: 60,
			bottom: 60,
			left: 80,
			right: 200,
		};
		const xMax = width - margin.left - margin.right;
		const yMax = height - margin.top - (!useBars ? margin.bottom : 100);

		// map data properties to axis
		const x = data => new Date(data.timestamp);

		// longitudinal merge: a set containing all items (so multiple items for each timestamp, one for each feature)
		let mergedData = [];
		keys.forEach(key => {
			mergedData = mergedData.concat(datasets[key].data);
		});
		//mergedData.sort((a,b) => {return a.timestamp < b.timestamp ? -1 : 1});


		let mergedBarData = [];
		let x0Scale = undefined;
		let x1Scale = undefined;
		let yScale = undefined;
		let zScale = undefined;
		let normalizedBarKeys = [];
		if (useBars){
			let barKeys = [];
			let mergedBarDataWithKeys = {};
			for(let i = 0; i<Object.values(this.props.datasets).length; i++) {
				let dataset = Object.values(this.props.datasets)[i];
				let data = dataset.data;
				for (let j = 0; j < data.length; j++) {
					if (!mergedBarDataWithKeys[data[j].timestamp]) {
						mergedBarDataWithKeys[data[j].timestamp] = {timestamp: data[j].timestamp};
					}
					mergedBarDataWithKeys[data[j].timestamp][dataset.featureName] = data[j].value;
				}
				barKeys.push(dataset.featureName);
			}
			mergedBarData = Object.values(mergedBarDataWithKeys);

			// normaliziation
			let featureMaxima = {};
			for(let i = 0; i<barKeys.length; i++){
				// get maximum of each feature
				featureMaxima[barKeys[i]] = max(mergedBarData, data => data[barKeys[i]]);
				normalizedBarKeys.push(`${barKeys[i]}-normalized`);
			}
			for(let i = 0; i<mergedBarData.length; i++){
				for (let j = 0; j<barKeys.length; j++) {
					mergedBarData[i][`${barKeys[j]}-normalized`] = mergedBarData[i][barKeys[j]]/featureMaxima[barKeys[j]];
				}
			}

			// scales
			x0Scale = scaleBand({
				rangeRound: [0, xMax],
				domain: mergedBarData.map(x),
				padding: 0.2,
				tickFormat: () => (val) => moment(val).format("MMM Do")
			});
			x1Scale = scaleBand({
				rangeRound: [0, x0Scale.bandwidth()],
				domain: normalizedBarKeys,
				padding: .1
			});
			yScale = scaleLinear({
				rangeRound: [yMax, 0],
				domain: [0, max(mergedBarData, (d) => {
					return max(normalizedBarKeys, (key) => d[key])
				})],
			});
			zScale = scaleOrdinal({
				domain: normalizedBarKeys,
				range: Object.values(this.props.datasets).map(dataset => dataset.color)
			});
		}



		// scale
		const xScale = scaleTime({
			range: [0, xMax],
			domain: extent(mergedData, x)
		});

		let linePaths = [];
		let bars = [];
		let yAxisComponent = "";
		for(let i = 0; i<Object.values(this.props.datasets).length; i++){
			let dataset = Object.values(this.props.datasets)[i];
			const y = data =>data[dataset.dataKey];
			let yScale = scaleLinear({
				range: [yMax, 0],
				domain: [0, max(dataset.data, y)]
			});

			// hovered data point x,y
			let hoveredDataPoint = undefined;
			if (this.state.position && this.state.positionDate) {
				// try to get datapoint for the hovered datetime for this feature
				let dataPoint = dataset.data.filter(aDataPoint => {
					return this.state.positionDate.getTime() == aDataPoint.timestamp
				})[0];
				if (dataPoint) {
					// if there is a point...
					hoveredDataPoint = {
						xPx: this.state.position.x,
						yPx: yScale(y(dataPoint)),
						dataObject: dataPoint
					};
				}
			}

			if (!useBars) {
				linePaths.push(
					<LinePath
						key={dataset.featureName}
						data={dataset.data}
						x={x}
						y={y}
						xScale={xScale}
						yScale={yScale}
						stroke={dataset.color}
						onTouchStart={data => event => this.handleLineHover(dataset.featureName)}
						onTouchMove={data => event => this.handleLineHover(dataset.featureName)}
						onMouseMove={data => event => this.handleLineHover(dataset.featureName)}
						onTouchEnd={data => event => this.setState({position: null, positionDate: null})}
						onMouseLeave={data => event => this.setState({position: null, positionDate: null})}
						curve={dataset.featureName == 'sleep' ? curveStepAfter : curveNatural}
						defined={d => {
							return d.value != null
						}}
					/>
				);
			}

			// TODO make this overlays more efficient, e.g. by moving it into a component to avoid rerendering the full graph
			if (hoveredDataPoint) {
					linePaths.push(
						<g key={`${dataset.featureName}-details`} transform={`translate(${hoveredDataPoint.xPx},${hoveredDataPoint.yPx})`}>
							<circle  r="4.5" fill="none" stroke="steelblue" />
							<text x="9" dy=".35em">{`${dataset.displayName}: ${Math.floor(hoveredDataPoint.dataObject.value*100)/100} ${dataset.displayUnit ? dataset.displayUnit : ''}`}</text>
						</g>
					);
			}

			if (this.state && this.state.yAxis == dataset.featureName){
				yAxisComponent = (
					<AxisLeft
						scale={yScale}
						top={0}
						left={0}
						label={`${dataset.displayName} ${dataset.displayUnit ? '('+dataset.displayUnit+')':''}`}
						stroke={'#1b1a1e'}
						tickTextFill={'#1b1a1e'}
					/>
				);
			}
		}


		if(useBars) {
				bars.push(
					<BarGroup
						key={`bargroup`}
						top={margin.top}
						data={mergedBarData}
						keys={normalizedBarKeys}
						height={yMax}
						x0={x}
						x0Scale={x0Scale}
						x1Scale={x1Scale}
						yScale={yScale}
						zScale={zScale}
						rx={4}
						onClick={data => event => {
							alert(`clicked: ${JSON.stringify(data)}`)
						}}
						onMouseOver={data => event => this.handleBarHover(event,data,margin,datasets,height)}
						onMouseLeave={data => event => this.setState({position: null, positionDate: null})}
					/>
				);
				bars.push(
					<AxisBottom
						scale={x0Scale}
						top={yMax + margin.top}
						stroke='#e5fd3d'
						tickStroke='#e5fd3d'
						hideAxisLine
						tickLabelProps={(value, index) => ({
							fill: '#000000',
							fontSize: 11,
							textAnchor: 'middle',
						})}
					/>
				);
			}


		let timesegmentNotes = [];
		this.props.timesegmentNotes.forEach(aTimesegmentNote => {
			let xLeftInSvg = 0;
			let xRightInSvg = 0;
			let itemWidth = 0;
			if (!useBars) {
				xLeftInSvg = xScale(aTimesegmentNote.dateFrom * 1000);
				xRightInSvg = xScale(aTimesegmentNote.dateTo * 1000);
			}
			else {
				// get index of startdate of note
				for (let i = 0; i<mergedBarData.length; i++) {
					if (moment.unix(mergedBarData[i].timestamp/1000).dayOfYear() == moment.unix(aTimesegmentNote.dateFrom).dayOfYear()) {
						xLeftInSvg = i*((width - margin.left - margin.right)/mergedBarData.length);
						console.log(`found note start day: ${ moment.unix(aTimesegmentNote.dateFrom)}`);
						break;
					}
				}
				for (let i = 0; i<mergedBarData.length; i++) {
					if (moment.unix(mergedBarData[i].timestamp/1000).dayOfYear() == moment.unix(aTimesegmentNote.dateTo).dayOfYear()) {
						xRightInSvg = (i+1)*((width - margin.left - margin.right)/mergedBarData.length);
						console.log(`found note end day: ${moment.unix(aTimesegmentNote.dateTo)}`);
						break;
					}
				}
			}

			itemWidth = Math.min(xRightInSvg, width - margin.right) - Math.max(xLeftInSvg, 0);
			console.log(`x left in svg: ${xLeftInSvg}, x rght in svg: ${xRightInSvg}`);

			// show only if in currently configured time range
			if (xRightInSvg > 0 && xLeftInSvg < width-margin.right) {
				timesegmentNotes.push(
					<g key={`timesegment-note-${xLeftInSvg}-${xRightInSvg}-${aTimesegmentNote.noteText}`} transform={`translate(${Math.max(xLeftInSvg, 0)},${-margin.top / 2})`}>
						<rect x="0" y="6" width={itemWidth}
							  height="3"></rect>
						<rect x="0" y="0" width="3"
							  height="15"></rect>
						<rect x={itemWidth - 3} y="0" width="3"
							  height="15"></rect>
						<text x="9" y="-10" dy=".35em">{aTimesegmentNote.noteText}</text>
					</g>
				)
			}

		});


		let myChart = (
			<svg width={width} height={height}>
				<Group top={margin.top} left={margin.left} >
					<rect top={margin.top} left={margin.left} width={width - margin.left} height={height - margin.top} style={{pointerEvents: 'all'}} fill="transparent" onMouseMove={reactSyntheticEvent => {
						if (!useBars) {
							this.handleGraphAreaHover(
								reactSyntheticEvent.nativeEvent,
								mergedData,
								x,
								xScale,
								margin
							)
						}
					}}
					onClick={reactSyntheticEvent => {
						this.handleGraphAreaClick(
							reactSyntheticEvent.nativeEvent,
							mergedData,
							x,
							xScale,
							margin
						)
					}}/>
					{!useBars && linePaths}
					{bars}
					{!useBars && this.state.position && (
							<Line
								from={{ x: this.state.position.x, y: 0 }}
								to={{ x: this.state.position.x, y: height }}
								strokeWidth={1}
							/>
					)}
					{useBars && this.state.position && (
						<g key={`details`} transform={`translate(${this.state.position.x},${this.state.position.y})`}>
							<circle  r="4.5" fill="none" stroke="steelblue" />
							<text x="9" dy=".35em">{`${this.state.position.hoveredFeatureName}: ${this.state.position.value}`}</text>
						</g>
					)}
					{!useBars && this.state.position && (
						<g key={`details-line-date`} transform={`translate(${this.state.position.x},${-margin.top/2})`}>
							<text x="9" dy=".35em">{moment(this.state.positionDate).format('ddd MMM Do [at] kk:mm')}</text>
						</g>
					)}
					{timesegmentNotes}
					{!useBars && (<AxisBottom
						scale={xScale}
						top={yMax}
						label={'Time'}
						stroke={'#1b1a1e'}
						tickTextFill={'#1b1a1e'}
					/>)}
					{yAxisComponent}
				</Group>
			</svg>
		);

		return (
			<div>
				{myChart}
			</div>
		);
	}

	handleLineHover(featureName){
		console.log(`hovering ${featureName}`);

		// display according y axis
		this.setState({
			yAxis: featureName
		});
	}

	handleBarHover(event, barData, margin, datasets, height){
		let eventXInSvg = event.offsetX - margin.left;  // the x value within the graph, where the user hovered
		let nonNormalizedFeatureName = barData.key.replace('-normalized','');

		this.setState({
			position: {
				x: event.nativeEvent.layerX-margin.left - 50,
				y: height - event.target.height.baseVal.value - 120,
				hoveredFeatureName: datasets[barData.key.replace('-normalized','')].displayName,
				value: `${Math.round(barData.data[nonNormalizedFeatureName]*10)/10} ${datasets[nonNormalizedFeatureName].displayUnit ? datasets[nonNormalizedFeatureName].displayUnit : ''}`
			}
		});
	}

	handleGraphAreaHover(event, data, xSelector, xScale, margin) {
		let eventXInSvg = event.offsetX - margin.left;  // the x value within the graph, where the user hovered

			const x0 = xScale.invert(eventXInSvg); // the datetime which the user hovered
		const bisectDate = bisector(xSelector).left;
			let index = bisectDate(data, x0, 1); // will be set to the index of the closest datapoint to the hovered point
			const d0 = data[index - 1]; // the next datapoint left to the hovered point
			const d1 = data[index]; // the next datapoint right to the hovered point
			let d = d0; // is set either the left or the right, depending on which one is closer to the hovered point
			if (d1 ){
				if (x0 - xSelector(d0) > xSelector(d1) - x0) {
					d = d1;
				} else {
					d = d0;
					index = index - 1;
				}

				this.setState({
					position: {
						index,
						x: xScale(xSelector(d)),
					},
					positionDate: xSelector(d)
				});
			}


	}

	handleGraphAreaClick(event, data, xSelector, xScale, margin) {
		let eventXInSvg = event.offsetX - margin.left;
		const x0 = xScale.invert(eventXInSvg); // the datetime which the user hovered

		this.props.timelineContainerRef.showTimesegmentNoteAddDialog(this.props.timelineContainerRef, x0);
	}
}

export default TimelineVis;