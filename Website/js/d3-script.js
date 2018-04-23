//=======================================================================================================================
//CSV Parse Code
//Source: http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f
//4 / 22 / 2018
//=======================================================================================================================
function parseLine(line) {
	return {
		Row_Num: parseInt(line["Row_Number"]),
		Time_Stamp: line["Time_Stamp"],
		SockOwner1_Name: line["SockOwner1_Name"],
		SockOwner1_Country: line["SockOwner1_Country"],
		SockOwner1_Gender: line['SockOwner1_Gender'],
		SockOwner1_Age: parseInt(line["SockOwner1_Age"])
	};
}

d3.csv("Sock_Data_LibraryMock.csv", parseLine, function (error, data) {

});


//=======================================================================================================================
//World Map Code
//Source: http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f
//4 / 22 / 2018
//=======================================================================================================================
var format = d3.format(",");
// Set tooltips
var tip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function (d) {
		return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Participation: </strong><span class='details'>" + format(d.population) + "</span>";
	})

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

var color = d3.scaleThreshold()
	.domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
	.range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

var path = d3.geoPath();

var worldSvg = d3.select("#worldmap")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.append('g')
	.attr('class', 'map');

var projection = d3.geoMercator()
	.scale(130)
	.translate([width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

worldSvg.call(tip);

queue()
	.defer(d3.json, "world_countries.json")
	.defer(d3.tsv, "world_population.tsv")
	.await(ready);

function ready(error, data, population) {
	var populationById = {};

	population.forEach(function (d) { populationById[d.id] = +d.population; });
	data.features.forEach(function (d) { d.population = populationById[d.id] });

	worldSvg.append("g")
		.attr("class", "countries")
		.selectAll("path")
		.data(data.features)
		.enter().append("path")
		.attr("d", path)
		.style("fill", function (d) { return color(populationById[d.id]); })
		.style('stroke', 'white')
		.style('stroke-width', 1.5)
		.style("opacity", 0.8)
		// tooltips
		.style("stroke", "white")
		.style('stroke-width', 0.3)
		.on('mouseover', function (d) {
			//console.log(d);
			tip.show(d);

			d3.select(this)
				.style("opacity", 1)
				.style("stroke", "#6f9600")//maybe change back to black?
				.style("stroke-width", 3);
		})
		.on('mouseout', function (d) {
			tip.hide(d);

			d3.select(this)
				.style("opacity", 0.8)
				.style("stroke", "white")
				.style("stroke-width", 0.3);
		})
		//Here I add the country name to the countryname div -CQ
		.on('click', function (d) {
			countryName = document.getElementById("countryname");
			if (countryName.hasChildNodes()) {
				countryName.removeChild(countryName.childNodes[0]);
			}

			var newCountryName = document.createElement('h1');
			newCountryName.appendChild(document.createTextNode('Country Selected: ' + d.properties.name));
			countryName.appendChild(newCountryName);
		});

	worldSvg.append("path")
		.datum(topojson.mesh(data.features, function (a, b) { return a.id !== b.id; }))
		// .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
		.attr("class", "names")
		.attr("d", path);
}
//=======================================================================================================================
//Slider Code
//=======================================================================================================================
var handlesSlider = document.getElementById('slider-handles');

noUiSlider.create(handlesSlider, {
	connect: true,
	tooltips: true,
	step: 1,
	margin: 5,
	start: [20, 80],
	range: {
		'min': [0],
		'max': [100]
	},
	pips: {
		mode: 'count',
		values: 5,
		density: 4
	}
});

//Might have to change to using something like this:
//$(function () {
//	$("#height-range-slider").slider({
//		range: true,
//		min: 0,
//		max: 100,
//		values: heightRange,
//		slide: function (event, ui) {
//			$("#height").val(printNumAsFeetInches(ui.values[0]) + " - " + printNumAsFeetInches(ui.values[1]));
//			heightRange = [ui.values[0], ui.values[1]];
//			update();
//		},
//		stop: function (event, ui) {

//		}
//	});
//	$("#height").val(printNumAsFeetInches(heightExtent[0]) + " - " + printNumAsFeetInches(heightExtent[1]));
//});

//=======================================================================================================================
//Smelly Socks Graph
//=======================================================================================================================

//			
//	1) Add an SVG to draw our line chart on
//2) Use the D3 standard margin convetion
//3) Create an x axis
//4) Create a y axis
//5) Create an x scale
//6) Create a y scale
//7) Create a line generator
//8) Create a random dataset
//9) Create a path object for the line
//			10) Bind the data to the path object
//11) Call the line generator on the data- bound path object
//12) Add circles to show each datapoint
//13) Add some basic styling to the chart so its easier on the eyes



// 2. Use the margin convention practice
var margin = { top: 50, right: 50, bottom: 50, left: 50 }
	, width = 960 - margin.left - margin.right // Use the window's width
	, height = 550 - margin.top - margin.bottom; // Use the window's height

// The number of datapoints
var n = 100;

// 5. X scale will use the index of our data
var xScale = d3.scaleLinear()
	.domain([0, n - 1]) // input
	.range([0, width]); // output

// 6. Y scale will use the randomly generate number
var yScale = d3.scaleLinear()
	.domain([0, 1]) // input
	.range([height, 0]); // output

// 7. d3's line generator
var line = d3.line()
	.x(function (d, i) { return xScale(i); }) // set the x values for the line generator
	.y(function (d) { return yScale(d.y); }) // set the y values for the line generator
	.curve(d3.curveMonotoneX) // apply smoothing to the line

// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
var dataset = d3.range(n).map(function (d) { return { "y": d3.randomUniform(1)() } })

// 1. Add the SVG to the page and employ #2
var svg2 = d3.select("#smellgraph").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 3. Call the x axis in a group tag
svg2.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// 4. Call the y axis in a group tag
svg2.append("g")
	.attr("class", "y axis")
	.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator
svg2.append("path")
	.datum(dataset) // 10. Binds data to the line
	.attr("class", "line") // Assign a class for styling
	.attr("d", line); // 11. Calls the line generator

// 12. Appends a circle for each datapoint
svg2.selectAll(".dot")
	.data(dataset)
	.enter().append("circle") // Uses the enter().append() method
	.attr("class", "dot") // Assign a class for styling
	.attr("cx", function (d, i) { return xScale(i) })
	.attr("cy", function (d) { return yScale(d.y) })
	.attr("r", 5);

