/* ========================================================================
 * Assignment code: visualization.js
 * ========================================================================
 * Course: IVIZ, Instructor: Dr. Subrat K. Dash
 * 
 * Submission by:
 * Ansh Mittal(17ucs028), Anshul Jain(17ucs029), Anshu Musaddi(17ucs185)
 * ======================================================================== */

// Global settings
let drawSpaceW = 900
let drawSpaceH = 570
let themeColor = "#195e83"

function renderChloropleth(mapInfo, drawSpace) {

    // Choose projection
    let myProjection = d3.geoMercator()
        .scale(800)
        .translate([-drawSpaceW,drawSpaceH]) // Uses global settings set above
    let geoPath = d3.geoPath().projection(myProjection)

	// Defining color scale
    let maxliteracy = d3.max(mapInfo.features, d=> d.properties.literacy)
    let cScale = d3.scaleLinear()
        .domain([0, maxliteracy])
        .range(["white",themeColor])

    // Writing to screen
    drawSpace.selectAll("path")
        .data(mapInfo.features)
        .enter()
        .append("path")
        .attr("d", d=>geoPath(d))
        .attr("stroke","black")
        .style("opacity", 0.7)
        .attr("fill", d => d.properties.literacy ? 
        cScale(d.properties.literacy) : // get color from value
        "grey") // color grey if value not found 
}

function renderFiveBars(data, drawSpace) {

    let positionScale = d3.scaleBand()
        .range([0,300])
        .domain(data.map(d => d.properties.ST_NM))
        .padding(0.3);

    let scaleBar = d3.scaleLinear()
        .range([0,400])
        .domain([data[4].properties.literacy-40,data[0].properties.literacy]);

    drawSpace
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill",d => themeColor)//cScale(d.properties.literacy))
        .attr("width",d => scaleBar(d.properties.literacy)+"px")
        .attr("height",positionScale.bandwidth())
        .attr("y",d => positionScale(d.properties.ST_NM))
        .text((d)=>d.properties.ST_NM+" ("+d.properties.literacy + ")");
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

    // Draw top 5 bars
    mapInfo.features.sort((a,b)=>a.properties.literacy-b.properties.literacy);
    
    bottomFive = mapInfo.features.slice(0,5).reverse();
    renderFiveBars(bottomFive, d3.select("#drawSpaceBottomBars"));
    
    topFive = mapInfo.features.slice(31,36).reverse();
    renderFiveBars(topFive, d3.select("#drawSpaceTopBars"));
}

function main() {
    Promise.all([
        d3.csv("data/literacy.csv"),
        d3.json("data/indianstates_outline.geojson")
    ]).then(collectData)
}

main();