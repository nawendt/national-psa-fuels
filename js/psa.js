const ak_base = "https://fire.ak.blm.gov/predsvcs/fuelfire.php";
const url_base = "https://www.predictiveservices.nifc.gov/fuels_fire-danger/PSAs";
const sacc_base = "https://gacc.nifc.gov/sacc/predictive/weather/99_dsi_stuff/gnfdrs7/chart_htmls"
psa_geoms = d3.json("./gis/psa.json");
gacc_geoms = d3.json("./gis/gacc.json");
state_geoms = d3.json("./gis/states.json");

layers = Promise.all([psa_geoms, gacc_geoms, state_geoms]).then(function(files) {
    layers = {
        psa: files[0],
        gacc: files[1],
        states: files[2],
    }
    return layers;
});

load_map = async function() {
    await layers;
    svg = d3.select(".basemap")
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", [0, 0, 975, 610]);

    path = d3.geoPath(d3.geoAlbersUsa());

    psa = svg.append("g")
        .attr("fill", "#444")
        .selectAll("path")
        .data(topojson.feature(layers.psa, layers.psa.objects.psa).features)
        .join("path")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("fill", "#a8a8a8");
            d3.select("text#info")
                .text(`${d.properties.PSANationalCode}: ${d.properties.PSANAME}`);
        }).on("mouseout", function() {
            d3.select(this)
                .attr("fill", "#444")
            d3.select("text#info")
                .text(null);
        }).on("click", function(event, d) {
            if (d.properties.GACCUnitID == "USGASAC") {
                link = `${sacc_base}/${d.properties.PSANationalCode}.html`;
            } else if (d.properties.GACCUnitID == "USAKACC") {
                link = ak_base;
            } else {
                link = `${url_base}/${d.properties.PSANationalCode}.html`;
            }
            window.open(link, "_blank");
        }).attr("d", path);

    states_outline = svg.append("g")
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 0.3)
        .attr("d", path(topojson.mesh(layers.states, layers.states.objects.states, (a, b) => a !== b)));

    psa_outline = svg.append("g")
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 0.4)
        .attr("d", path(topojson.mesh(layers.psa, layers.psa.objects.psa, (a, b) => a !== b)));

    gacc_outline = svg.append("g")
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#008a8a")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 1.2)
        .attr("d", path(topojson.mesh(layers.gacc, layers.gacc.objects.gacc, (a, b) => a !== b)));

    tbox = svg.append("g")
        .attr("transform", "translate(337.5, 10)");

    tbox.append("rect")
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 300)
        .attr("height", 25)
        .attr("stroke", "black")
        .attr("fill", "white");

    w = tbox.node().getBBox().width;
    h = tbox.node().getBBox().height;

    tbox.append("text")
        .attr("id", "info")
        .attr("x", 0.5 * w)
        .attr("y", 0.5 * h)
        .attr('fill', 'black')
        .attr("font-family", "Arial,sans-serif")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "10px");
}
7