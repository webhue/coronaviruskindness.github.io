// This is the published Google Sheet from which the data are obtained.
var publishedData = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx-MgeekVffmrTB7oA7AhlGP7aEpcZIDnFBLCBQL5mEUKNnYVzoR-hT_kMuA6sIEdlLmyihIJ1oO49/pub?gid=1652908691&single=true&output=csv';


var rad_Earth  = 6378.16;
var one_degree = (2 * Math.PI * rad_Earth) / 360;
var one_km     = 1 / one_degree;

function randomInRange(from, to, fixed) {
  fixed = fixed || 10;
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

function jitter(lat, lng, kms, fixed) {
  return {
    lat : randomInRange(
      lat - (kms * one_km),
      lat + (kms * one_km),
      fixed
    ),
    lng : randomInRange(
      lng - (kms * one_km),
      lng + (kms * one_km),
      fixed
    )
  };
};

// Define the heart marlker
var heartMarker = L.icon({
	iconUrl: 'img/kindness-marker.png',
        iconSize:     [32, 48],
        //iconAnchor:   [0, 2],
        popupAnchor:  [0, 0]
});

// Initialize the basemap to the container div
var mymap = L.map('mapid').setView([0, 0], 2);

// Set the basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>',
}).addTo(mymap);

// Load all data and set to the map
//d3.csv("data.csv", function(d) {
d3.csv(publishedData, function(d) {
	// Jitter each location slightly to prevent overlap
        var jittered = jitter(parseFloat(d.latitude), parseFloat(d.longitude), 0.3); // Jitter with radius 100m (0.1kms)
	return {
        	lat : jittered.lat,
		lon : jittered.lng,
		title: d.title,
		info : d.information,
		date: d.date,
		url : d.url,
		giver : d.giver,
		recipient : d.recipient,
		contribute: d.contribute
		};
		}).then(function(data) {
			for(var i = 0; i < data.length; i++){
				console.log(data[i]);
				if (data[i].lat == "" || data[i].lon == "") continue;

				var contributeHtml = '';
				if (data[i].contribute != "") {
					// Add a button to the popup box					
					contributeHtml = "<br><br>Want to help? &nbsp; <a href='" + data[i].contribute + "' target='_blank'><button class='button-small'><b>Contribute</b></button></a>";
					
					// Append this article to the contribution DIV
					document.getElementById('contribute').innerHTML += "<tr><td><a href='" + data[i].contribute + "' target='_blank'><button class='button'><b>Contribute</b></button></a></td><td id='towrap' word-wrap='break-word'><b><a href='" + data[i].url + "' target='_blank'>" + data[i].title + "</a></b></td></tr><br>";
				}
				// Create the Marker!
				L.marker([data[i].lat, data[i].lon], {icon: heartMarker}).addTo(mymap).bindPopup("<b><a href='" + data[i].url + "' target='_blank'>" + data[i].title + "</a></b><br>Date: " + data[i].date + "<br>" + data[i].giver + " &#8594; " + data[i].recipient + "<br>"+ data[i].info + contributeHtml).openPopup();

				// Set the HTML count for number of stories as we fly through them!
				var totalaok = i + 1;
				document.getElementById("total-aok").innerHTML = 'Number of Acts of Kindness: <font color="#c1006e" size="4">' + totalaok.toString() + '</font>';
			};
			
			// After parsing all entries, we need to close the table in the contribution section!
			document.getElementById('contribute').innerHTML += "</table>";

			// Wrap wording in all table descriptions
			//document.getElementsByTagName("td").style.wordWrap = "break-word";
		});



