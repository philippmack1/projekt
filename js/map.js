window.onload = function () {
// WMTS-Layer
    L.TileLayer.Common = L.TileLayer.extend({
        initialize: function (options) {
            L.TileLayer.prototype.initialize.call(this, this.url, options);
        }
    });

    var layers = {
        osm: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            subdomains: ['a', 'b', 'c'],
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }),
        /*ortophoto: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
         attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping,
         Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
         }),*/
        laender_topo: OpenMapSurfer_Roads = L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
            maxZoom: 20,
            attribution: 'Imagery from ' +
            '<a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> ' +
            '&mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }),

        NASA: new L.GIBSLayer('BlueMarble_ShadedRelief', {
            date: new Date('currentDate'),
            transparent: true
        }),
        night: new L.GIBSLayer('VIIRS_CityLights_2012', {
            date: new Date('currentDate'),
            transparent: true
        }),
        opentopo: new L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>,' +
            ' <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; ' +
            '<a href="https://opentopomap.org">OpenTopoMap</a> ' +
            '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        })
    };

// define map
    var map = L.map('map', {
        layers: [layers.NASA],
        center: [25.8, 7.4],
        zoom: 2
    });

// Maßstab hinzufügen
    L.control.scale({
        maxWidth: 200,
        metric: true,
        imperial: false
    }).addTo(map);


// WMTS-Layer Auswahl hinzufügen
    var layerControl = L.control.layers({
        //"Orthophoto": layers.ortophoto,
        "Blue Marble": layers.NASA,
        "L&aumlnder-Topographie": layers.laender_topo,
        "OpenTopoMap": layers.opentopo,
        "World at night": layers.night,
        "OpenStreetMap": layers.osm
    }).addTo(map);

// leaflet-hash aktivieren
    var hash = new L.Hash(map);

// Marker cluster
    var cluster_group = L.markerClusterGroup();

    //load image data and make marker and popup
    var allImages = document.getElementsByClassName("pictures");
    console.log(allImages);
    var pictureIcon = L.icon({
        iconUrl: 'icons/picture.png',
        iconAnchor: [16, 37],
        popupAnchor: [1, -34]
    });
    var markerGroup = L.featureGroup().addTo(map);
    for (var i = 0; i < allImages.length; i += 1) {
        console.log(allImages[i]);
        EXIF.getData(allImages[i], function () {
            var author = EXIF.getTag(this, "Copyright");
            var lat_arr = EXIF.getTag(this, "GPSLatitude");
            var lng_arr = EXIF.getTag(this, "GPSLongitude");
            var lat = lat_arr[0] + (lat_arr[1] / 60);
            var lng = lng_arr[0] + (lng_arr[1] / 60);
            var latRef = EXIF.getTag(this, "GPSLatitudeRef");
            var lngRef = EXIF.getTag(this, "GPSLongitudeRef");
            if (latRef === "S") {
                lat = lat * -1
            }
            if (lngRef === "W") {
                lng = lng * -1
            }
            var mrk = L.marker([lat, lng], {icon: pictureIcon});
            var popup = "<a href=" + this.src + "><img src='" + this.src + "' class='thumbnail'/></a>" +
                '<br/>Picture by <a href="photographers.html">' + author + '<a/>' +
                '<br/>Latitude: ' + lat + " " + latRef +
                '<br/>Longitude: ' + lng + " " + lngRef;

            mrk.bindPopup(popup).addTo(cluster_group);
            cluster_group.addTo(map);
        });
    }
};