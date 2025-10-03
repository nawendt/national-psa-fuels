const akcc_base = "https://fire.ak.blm.gov/predsvcs/fuelfire.php";
const sacc_base = "https://gacc.nifc.gov/sacc/predictive/fuels_fire_danger/SA_PSA_Indices/SACC_Fuels_Charts";
const eacc_base = "https://gacc.nifc.gov/eacc/predictive_services/fuels_fire-danger/fuels_fire-danger_files/EA_PSA_Fire_Danger_Graphs";
const rmcc_base = "https://gacc.nifc.gov/rmcc/images/predictive/nfdrs";
const nrcc_base = "https://gacc.nifc.gov/nrcc/predictive/fuels_fire-danger/graphs/GraphPlots";
const swcc_base = "https://gacc.nifc.gov/swcc/predictive/fuels_fire-danger/nfdrs_charts/SW_Charts/images";
const gbcc_base = "https://gacc.nifc.gov/gbcc/predictive/new_PSA_ERCmap/ercY/charts";
const nwcc_base = "https://gacc.nifc.gov/nwcc/content/products/fwx/matrices";
const oncc_base = "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/ONCC_ERC/FeatureServer/1";
const oscc_base = "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/ONCC_ERC/FeatureServer/1";
const psa_geoms = d3.json("./gis/psa.json");
const gacc_geoms = d3.json("./gis/gacc.json");
const state_geoms = d3.json("./gis/states.json");
let link;

let layers = Promise.all([psa_geoms, gacc_geoms, state_geoms]).then(function(files) {
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
                link = `${sacc_base}/PSA${d.properties.PSANationalCode.slice(2)}_Fuels/ERCY.png`;
            } else if (d.properties.GACCUnitID == "USWIEACC") {
                let psa = d.properties.PSANationalCode;
                if (["EA10", "EA11"].includes(psa)) {
                    psa = "EA10_11";
                }
                link = `
                <!DOCTYPE html>
                <html lang="en-US">
                <head>
                  <meta charset="utf-8">
                  <title>${d.properties.PSANationalCode} Fuel Charts</title>
                  <style>
                    body {
                        background-color: #757575;
                    }
                  </style>
                </head>
                <body>
                    <img src="${eacc_base}/${psa}_ERC.jpeg" />
                    <img src="${eacc_base}/${psa}_100.jpeg" />
                    <img src="${eacc_base}/${psa}_1000.jpeg" />
                </body>
                </html>
                `;
            } else if (d.properties.GACCUnitID == "USCORMC") {
                link = `
                <!DOCTYPE html>
                <html lang="en-US">
                <head>
                  <meta charset="utf-8">
                  <title>${d.properties.PSANationalCode} Fuel Charts</title>
                  <style>
                    body {
                        background-color: #757575;
                    }
                    img {
                        width: 1000px;
                    }
                  </style>
                </head>
                <body>
                    <img src="${rmcc_base}/${d.properties.PSANationalCode}_ERC.png" />
                    <img src="${rmcc_base}/${d.properties.PSANationalCode}_FM100.png" />
                    <img src="${rmcc_base}/${d.properties.PSANationalCode}_FM1000.png" />
                </body>
                </html>
                `;
            } else if (d.properties.GACCUnitID == "USMTNRC") {
                link = `
                <!DOCTYPE html>
                <html lang="en-US">
                <head>
                  <meta charset="utf-8">
                  <title>${d.properties.PSANationalCode} Fuel Charts</title>
                  <style>
                    body {
                        background-color: #757575;
                    }
                  </style>
                </head>
                <body>
                    <img src="${nrcc_base}/ERC-${parseInt(d.properties.PSANationalCode.slice(2))}.jpeg" />
                    <img src="${nrcc_base}/FM1000-${parseInt(d.properties.PSANationalCode.slice(2))}.jpeg" />
                    <img src="${nrcc_base}/FM100-${parseInt(d.properties.PSANationalCode.slice(2))}.jpeg" />
                </body>
                </html>
                `;
            } else if (d.properties.GACCUnitID == "USNMSWC") {
                if (d.properties.PSANationalCode.slice(-1).includes('S') || d.properties.PSANationalCode.slice(-1).includes('N')) {
                    link = `${swcc_base}/PSA_${parseInt(d.properties.PSANationalCode.slice(2))}${d.properties.PSANationalCode.slice(-1)}.png`;
                } else {
                    link = `${swcc_base}/PSA_${parseInt(d.properties.PSANationalCode.slice(2))}.png`;
                }
            } else if (d.properties.GACCUnitID == "USUTGBC") {
                link = `
                <!DOCTYPE html>
                <html lang="en-US">
                <head>
                  <meta charset="utf-8">
                  <title>${d.properties.PSANationalCode} Fuel Charts</title>
                  <style>
                    body {
                        background-color: #757575;
                    }
                  </style>
                </head>
                <body>
                    <img src="${gbcc_base}/${d.properties.PSANationalCode}-1.jpeg">
                    <img src="${gbcc_base}/${d.properties.PSANationalCode}-3.jpeg">
                    <img src="${gbcc_base}/${d.properties.PSANationalCode}-4.jpeg">
                </body>
                </html>
                `;
            } else if (d.properties.GACCUnitID == "USORNWC") {
                link = `
                <!DOCTYPE html>
                <html lang="en-US">
                <head>
                  <meta charset="utf-8">
                  <title>${d.properties.PSANationalCode} Fuel Charts</title>
                  <style>
                    body {
                        background-color: #757575;
                    }
                  </style>
                </head>
                <body>
                    <img src="${nwcc_base}/${d.properties.PSANationalCode}_ERC.jpg" />
                    <img src="${nwcc_base}/${d.properties.PSANationalCode}_100hr.jpg" />
                    <img src="${nwcc_base}/${d.properties.PSANationalCode}_1000hr.jpg" />
                    <img src="${nwcc_base}/${d.properties.PSANationalCode}_HRB.jpg" />
                    <img src="${nwcc_base}/${d.properties.PSANationalCode}_WDY.jpg" />
                </body>
                </html>
                `;
            } else if (d.properties.GACCUnitID == "USCAONCC") {
                let psa = d.properties.PSANationalCode;
                if (psa.slice(2) == "03B") {
                    psa = 4;
                } else if (parseInt(psa.slice(2)) >= 4) {
                    psa = parseInt(psa.slice(2)) + 1;
                } else {
                    psa = parseInt(psa.slice(2));
                }
                let attachment = 4 * psa - 3;
                link = `
                <!DOCTYPE html>
                <html lang="en-US">
                <head>
                  <meta charset="utf-8">
                  <title>${d.properties.PSANationalCode} Fuel Charts</title>
                  <style>
                    body {
                        background-color: #757575;
                    }
                  </style>
                </head>
                <body>
                    <img src="${oncc_base}/${psa}/attachments/${attachment}" />
                    <img src="${oncc_base}/${psa}/attachments/${attachment + 2}" />
                    <img src="${oncc_base}/${psa}/attachments/${attachment + 3}" />
                </body>
                </html>
                `;
            } else if (d.properties.GACCUnitID == "USCAOSCC") {
                let psa = d.properties.PSANationalCode;
                psa = parseInt(psa.slice(2))
                let id = psa + 9;
                let attachment = 4 * psa + 33;
                link = `
                <!DOCTYPE html>
                <html lang="en-US">
                <head>
                  <meta charset="utf-8">
                  <title>${d.properties.PSANationalCode} Fuel Charts</title>
                  <style>
                    body {
                        background-color: #757575;
                    }
                  </style>
                </head>
                <body>
                    <img src="${oscc_base}/${id}/attachments/${attachment}" />
                    <img src="${oscc_base}/${id}/attachments/${attachment + 2}" />
                    <img src="${oscc_base}/${id}/attachments/${attachment + 3}" />
                </body>
                </html>
                `;
            } else if (d.properties.GACCUnitID == "USAKACC") {
                link = akcc_base;
            } else {
                window.alert("No URL for PSA.");
                throw new Error("PSA URL error.");
            }

            if (["USUTGBC", "USORNWC", "USCORMC", "USWIEACC",
                 "USMTNRC", "USCAONCC", "USCAOSCC"].includes(d.properties.GACCUnitID)) {
                let page = window.open("about:blank", "_blank");
                page.document.write(link);
                page.document.close();
            } else {
                window.open(link, "_blank");
            }
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
