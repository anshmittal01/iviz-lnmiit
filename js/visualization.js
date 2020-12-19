/* ========================================================================
 * Assignment code: visualization.js
 * ========================================================================
 * Course: IVIZ, Instructor: Dr. Subrat K. Dash
 * 
 * Submission by:
 * Ansh Mittal(17ucs028), Anshul Jain(17ucs029), Anshu Musaddi(17ucs185)
 * ======================================================================== */

// Global settings
let maxColorValue = "#6155a6"
let minColorValue = "#ffe6e6"

function showMapHelper(d, i, drawSpace) {
	let tooltip = drawSpace.select("div").append("span")
        .attr("class", "ccc")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "60px")
        .style("height", "28px")
        .style("padding", "2px")
        .style("font", "12px sans-serif")
        .style("background", "lightsteelblue")
        .style("border", "0px")
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .text(i.properties.literacy)
}

function renderChloropleth(mapInfo, drawSpace) {

	let drawSpaceW = 930
	let drawSpaceH = 630

    // Choose projection
    let myProjection = d3.geoMercator()
        .scale(900)
        .translate([-drawSpaceW,drawSpaceH])
    let geoPath = d3.geoPath().projection(myProjection)

	// Defining color scale
    let maxliteracy = d3.max(mapInfo.features, d=> d.properties.literacy)
    let cScale = d3.scaleLinear()
        .domain([0, maxliteracy])
        .range([minColorValue,maxColorValue])

    // Writing to screen
    drawSpace.selectAll("path")
        .data(mapInfo.features)
        .enter()
        .append("path")
        .attr("d", d=>geoPath(d))
        .attr("stroke","white")
        .style("stroke-opacity", 0.8)
        .attr("fill", d => cScale(d.properties.literacy))
        .on('mouseover', function(d, i) {
        	d3.select(this)
        		.attr("fill", "black")
        		.style("stroke-opacity", 1)
        	console.log(this);
        })
        .on('mouseout', function(d, i) {
        	d3.select(this)
        		.attr("fill",d=> cScale(d.properties.literacy))
        		.style("stroke-opacity", 0.8)
        })  
}

function renderFiveBars(data, drawSpace) {

	let chartW = 300
	let chartH = 300
	let xOffset = 80

	drawSpace.attr("transform", "translate("+100+",0)")

    console.log(data)
    let maxliteracy = d3.max(data, d=> d.properties.literacy)
    let cScale = d3.scaleLinear()
        .domain([0, 100])
        .range([minColorValue,maxColorValue])

    let positionScale = d3.scaleBand()
        .range([0,chartH])
        .domain(data.map(d => d.properties.ST_NM))
        .padding(0.3);

    let scaleBar = d3.scaleLinear()
        .range([0,chartW])
        .domain([0, Math.max(15,maxliteracy)]);

    // For X-axis
    let xAxisGrid = d3.axisBottom(scaleBar).tickSize(-chartH).tickFormat('').ticks(3);
    drawSpace
    	.append('g')
		.attr("class", "xAxis axis-grid")
		.attr("transform", "translate("+xOffset+","+ chartH +")")
		.style("stroke-opacity", "0.1")
		.style("stroke", "black")
		.call(xAxisGrid)
    let xAxis = d3.axisBottom(scaleBar).ticks(3).tickFormat(d => d+" %")
    drawSpace
    	.append('g')
    	.attr("class", "xAxis")
        .attr("transform", "translate("+xOffset+","+ chartH +")")
    	.call(xAxis)

    // Plot data
    drawSpace
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill",d => cScale(d.properties.literacy))
        .attr("width",d => scaleBar(d.properties.literacy)+"px")
        .attr("height",positionScale.bandwidth())
        .attr("y",d => positionScale(d.properties.ST_NM))
        .attr("x", xOffset)
        .text((d)=>d.properties.ST_NM+" ("+d.properties.literacy + ")")

    // For Y-axis
    let yAxis = d3.axisLeft(positionScale)
    drawSpace
    	.append('g')
    	.attr("class", "yAxis")
        .attr("transform", "translate("+xOffset+", 0)")
        .call(yAxis)
}

function collectData(dataSources) {
    
    // Collect data sources
    let literacyInfo = dataSources[0]
    let mapInfo = dataSources[1]

    // Tweak data according to GeoJSON
    let dataIndex = {}
    for( let x of literacyInfo){
        if (x.State_UT === "Jammu And Kashmir")
            x.State_UT = "Jammu & Kashmir"
        else if (x.State_UT === "Andaman & Nicobar Islands")
            x.State_UT = "Andaman & Nicobar"
        else if (x.State_UT === "Dadra & Nagar Haveli" || x.State_UT === "Daman & Diu")
            x.State_UT = "Dadra and Nagar Haveli and Daman and Diu"

        dataIndex[x.State_UT] = +x["All Schools"];
    }
    dataIndex["Ladakh"] = dataIndex["Jammu & Kashmir"];

    // Combining data with GeoJSON object 
    mapInfo.features = mapInfo.features.map(d =>{
        d.properties.literacy = dataIndex[d.properties.ST_NM];
        return d;
    })

    renderChloropleth(mapInfo, d3.select("#drawSpaceMap"));

    mapInfo.features.sort((a,b)=> d3.descending(a.properties.literacy, b.properties.literacy));
    
    topFive = mapInfo.features.slice(0,5);
    renderFiveBars(topFive, d3.select("#drawSpaceTopBars"));

    bottomFive = mapInfo.features.slice(-5);
    renderFiveBars(bottomFive, d3.select("#drawSpaceBottomBars"));
}

function main() {
    Promise.all([
        d3.csv("data/literacy.csv"),
        d3.json("data/indianstates_outline.geojson")
    ]).then(collectData)
}

main();