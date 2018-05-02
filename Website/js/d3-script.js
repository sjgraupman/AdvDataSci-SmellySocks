//=======================================================================================================================
//CSV Parse Code
//Source: http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f
//4 / 22 / 2018
//=======================================================================================================================
var globalData;
var globalGender;
var minAge = 0;
var maxAge = 100;
var user = {};
var results;
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
var countries = [];
// Set tooltips for map
var tip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function (d) {
		return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Population: </strong><span class='details'>" + format(d.population) + "</span>";
	})

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
	width = 600,
	height = 300;

var color = d3.scaleThreshold()
	.domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
	.range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

var path = d3.geoPath();

var worldSvg = d3.select("#worldmap")
	.append("svg")
	.classed("svg-container", true) //container class to make it responsive
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", "0 0 600 300")
	.append('g')
	.attr('class', 'map');

var projection = d3.geoMercator()
	.scale(width / 2.5 / Math.PI)
	.translate([width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

worldSvg.call(tip);

queue()
	.defer(d3.json, "world_countries.json")
	.defer(d3.tsv, "world_population.tsv")
	.await(ready);

function checkForCountry(d) {
	for (var i = 0; i < countries.length; i++) {
		if (countries[i] == d.properties.name) {
			return true;
		}
	}
	return false;
}
function ready(error, data, population) {
	var populationById = {};

	population.forEach(function (d) { populationById[d.id] = +d.population; });
	data.features.forEach(function (d) { d.population = populationById[d.id] });
	globalData = data;
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
			tip.show(d);

			d3.select(this)
				.style("opacity", 1)
				.style("stroke", "#6f9600")//maybe change back to black?
				.style("stroke-width", 3);
		})
		.on('mouseout', function (d) {
			tip.hide(d);

			var highlight = checkForCountry(d); //Returns a boolean that if true, means that the country should remain highlighted

			if (!highlight) {
				d3.select(this)
					.style("opacity", 0.8)
					.style("stroke", "white")
					.style("stroke-width", 0.3);
			}
		})
		//Here I add the country name to the countryname div -CQ
		.on('click', function (d) {
			if (checkForCountry(d)) {
				countries = countries.filter(cname => cname !== d.properties.name);
				d3.select(this)
					.style("opacity", 0.8)
					.style("stroke", "white")
					.style("stroke-width", 0.3);
			} else {
				countries.push(d.properties.name);
				d3.select(this)
					.style("opacity", 1)
					.style("stroke", "#6f9600")//maybe change back to black?
					.style("stroke-width", 3);
			}

			var allCountries = '';
			countryName = document.getElementById("countryname");
			if (countryName.hasChildNodes()) {
				countryName.removeChild(countryName.childNodes[0]);
			}
			var newCountryName = document.createElement('h3');
			for (var i = 0; i < countries.length; i++) {
				if ((i + 1) == (countries.length)) {
					allCountries += countries[i];
				} else {
					allCountries += countries[i] + ", ";
				}
			}
			newCountryName.appendChild(document.createTextNode(allCountries));
			countryName.appendChild(newCountryName);

			console.log(countries);
		});
	worldSvg.append("path")
		.datum(topojson.mesh(data.features, function (a, b) { return a.id !== b.id; }))
		// .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
		.attr("class", "names")
		.attr("d", path);

	handlesSlider.noUiSlider.on('change', function (values, handle) {
		console.log("min: " + values[0] + " max: " + values[1]);
		minAge = parseInt(values[0]);
		maxAge = parseInt(values[1]);
		//re-run this simulation anytime this is changed
		run_simulation();
	});
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

// 2. Use the margin convention practice
var margin = { top: 50, right: 50, bottom: 50, left: 50 }
	//Update padding with new margins
	, width = width - margin.left - margin.right
	, height = height - margin.top - margin.bottom;

var xScale = d3.scaleLinear()
	.domain([minAge, maxAge]) // input
	.range([0, width]); // output

var yScale = d3.scaleLinear()
	.domain([0, 1]) // input
	.range([height, 0]); // output
// Add the SVG to the page and employ #2
var svg2 = d3.select("#smellgraph").append("svg")
	.classed("svg-container", true) //container class to make it responsive
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", "0 0 600 300")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Call the x axis in a group tag
// TO-DO Label this Age
svg2.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom
svg2.append("text")
	.attr("x", width / 2)
	.attr("y", height + .75 * margin.bottom)
	.style("text-anchor", "middle")
	.text("Age");
// 4. Call the y axis in a group tag
// TO-DO Label this Smelliness
svg2.append("g")
	.attr("class", "y axis")
	.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
svg2.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 0 - margin.left / 2)
	.attr("x", 0 - (height / 2))
	.style("text-anchor", "middle")
	.text("Smelliness");
//=======================================================================================================================
// Code for getting information from UI
//=======================================================================================================================
//This is what gets what gender is selected to run the simulation not what the user inputted
d3.selectAll("input[name='gender']").on("change", function () {
	globalGender = this.value;
	//re-run this simulation anytime this is changed
	results = run_simulation()
});
//=======================================================================================================================
// Button Functionality
//=======================================================================================================================
d3.select('#enter-information').on("click", function () {
	d3.select(this).text("Edit Information");
	d3.selectAll("#entry-information").toggle();
	getUserData();
});
d3.select('#run-simulation').on("click", function () {
	d3.select(this).text("Run Simulation Again");
	results = run_simulation();
});
//source: https://blog.webkid.io/replacing-jquery-with-d3/
d3.selection.prototype.toggle = function () {
	var isHidden = this.style('display') == 'none';
	return this.style('display', isHidden ? 'inherit' : 'none');
}

function scale_colors(gender) {
	if (gender == 'F') return 'pink';
	else return 'blue'
}

//Make simulation it's own function

function run_simulation() {
	var results = [];
	if (!jQuery.isEmptyObject(user)) {
		results.push(user);
	}
	//TO-DO Swap out 100 for number of set simulations
	for (var i = 0; i < 100; i++) {
		//TO-DO make this correlate to slider
		var age = generateAge(minAge, maxAge);
		var gender;
		if (typeof globalGender == "undefined" || globalGender == "B") {
			gender = generateGender();
		}
		else { gender = globalGender; }
		if (countries.length == 0) {
			var country = generateCountry(globalData);
		}
		else {
			var country = generateCountry2(countries);
		}
		var participant = { age: age, gender: gender, country: country };
		var smelliness = getSmelliness(participant);
		participant.smelliness = smelliness;
		results.push(participant);
	}

	var smellinessByGender = d3.nest()
		.key(function (d) { return d.gender; })
		.rollup(function (v) { return d3.mean(v, function (d) { return d.smelliness; }); })
		.entries(results);

	var smellinessByAge = d3.nest()
		.key(function (d) { return d.age; })
		.rollup(function (v) { return d3.mean(v, function (d) { return d.smelliness; }); })
		.entries(results);

	var smellinessByCountry = d3.nest()
		.key(function (d) { return d.country; })
		.rollup(function (v) {
			return {
				count: v.length,
				avg: d3.mean(v, function (d) { return d.smelliness; })
			};
		})
		.entries(results);

	var xScale = d3.scaleLinear()
		.domain([minAge, maxAge]) // input
		.range([0, width]);
	svg2.select("g")
		.transition()
		.duration(1000)
		.call(d3.axisBottom(xScale));

	// source: http://bl.ocks.org/Caged/6476579
	var div = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	svg2.selectAll("circle").remove();
	svg2.selectAll(".dot")
		.data(results)
		.enter().append("circle") // Uses the enter().append() method
		.attr("class", "dot") // Assign a class for styling
		.attr("cx", function (d) { return xScale(d.age) })
		.attr("cy", function (d) { return yScale(d.smelliness) })
		.style("fill", function (d) {
			if (typeof d.Name != "undefined") {
				return ("red");
			}
			else { return scale_colors(d.gender) }
		})
		.attr("r", function (d) {
			if (typeof d.Name != "undefined") {
				return 5;
			}
			else { return 3 };
		})
		.on("mouseover", function (d) {
			div.transition()
				.duration(200)
				.style("opacity", .9);
			div.html("Age: " + d.age + "<br/>" + "Smelliness: " + d.smelliness.toFixed(2) + "<br/>" + "Country of Origin: " + d.country)
				.style("left", d3.event.pageX + "px")
				.style("top", (d3.event.pageY) + "px");
		})
		.on("mouseout", function (d) {
			div.transition()
				.duration(500)
				.style("opacity", 0);
		});

	if (!jQuery.isEmptyObject(user)) {
		var smellier = 0;
		for (i = 1; i < results.length; i++) {
			if (results[i].smelliness < user.smelliness) {
				smellier++;
			}
		}
		svg2.select("#graphtitle").remove("text");
		svg2.append("text")
			.attr("id", "graphtitle")
			.attr("x", (width / 2))
			.attr("y", 0 - (margin.top / 2))
			.attr("text-anchor", "middle")
			.style("font-size", "16px")
			.style("text-decoration", "underline")
			.text("You won " + smellier + "% of the races");
		svg2.selectAll("line").remove();
		svg2.append("line")
				.attr("x1", 0)
				.attr("y1", yScale(user.smelliness))
				.attr("x2", xScale(width))
				.attr("y2", yScale(user.smelliness))
				.attr("stroke", "red");
	}

	return results;
}

function generateAge(minAge, maxAge) {
	var age = Math.floor(Math.random() * (maxAge - minAge) + minAge + 1);
	return age;
}

//This is equally likely to generate a male or female
function generateGender() {
	var rand = Math.random();
	var gender;
	if (rand < .5) {
		gender = 'F';
	}
	else {
		gender = 'M';
	}
	return gender;
}

//This is equally likely to generate each country
// TO-DO change this to match the population of the country.
function generateCountry(data) {
	var rand = Math.floor((Math.random() * data.features.length));
	var country = data.features[rand].properties.name;
	return country;
}

function generateCountry2(countries) {
	var rand = Math.floor((Math.random() * countries.length));
	var country = countries[rand];
	return country;
}
//TO-DO Evaluate how we want simulate smelliness
function getSmelliness(participant) {
	var mean;
	if (participant.gender == 'F') {
		mean = .58;
	}
	else {
		mean = .595;
	}
	if (participant.age < 20)
		//Kids smell more than adults
		mean -= .005 * (20 - participant.age);
	else
		mean += .002 * (participant.age - 20);
	var smelliness = d3.randomNormal(mean, .15)();
	if (smelliness < 0) smelliness = 0;
	if (smelliness > 1) smelliness = 1;
	return smelliness;
}

function getUserData() {
	user.country = d3.select("#userCountry").node().value;
	user.age = d3.select("input[name='userage']").property("value");
	user.Name = d3.select("input[name='username']").property("value");
	user.gender = d3.select('input[name="usergender"]:checked').node().value;
	user.smelliness = getSmelliness(user);

}