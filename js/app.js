//declare map variable in global scope 
var map;
//declare an array of locations to be shown on the map with lat,lng and title
var locations = [{
    location: {
        lat: 12.4215561,
        lng: 76.6931273
    },
    'title': 'Srirangapattanam'
}, {
    location: {
        lat: 12.303889,
        lng: 76.65444400000001
    },
    'title': 'Mysore Palace'
}, {
    location: {
        lat: 12.302778,
        lng: 76.67361099999999
    },
    'title': 'Karanji Lake'
}, {
    location: {
        lat: 12.30242,
        lng: 76.663762
    },
    'title': 'Mysore Zoo'
}, {
    location: {
        lat: 12.4254763,
        lng: 76.5724381
    },
    'title': 'Krishna Raja Sagara'
}];
//This is where we initialize the map. Guidelines obtained from Google Maps Developers website
// We set the parameters such as zoom,lat and lng.
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 12.409603,
            lng: 76.653544
        },
        zoom: 10
    });
    //responsive google map to recentre the markers
    //reference : http://stackoverflow.com/questions/15421369/responsive-google-map
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });
    ko.applyBindings(new viewModel());
}

//viewmodel 
var viewModel = function() {

    var self = this;

    //create a KO observable array of locations to be used for looping over.

    self.placeList = ko.observableArray(locations);
    //we loop over this observable array and create markers and infowindows for each location.
    self.placeList().forEach(function(place) {

        // creating markers  
        var marker = new google.maps.Marker({
            title: place.name,
            position: place.location,
            map: map
        });
        place.marker = marker;

        // Creating InfoWindows
        self.infoWindow = new google.maps.InfoWindow();

        // Adding an event listener to animate marker
        // and open infowindow when clicked
        marker.addListener('click', function() {
            self.infoWindow.setContent(place.title);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 750);
            self.infoWindow.open(map, marker);

            var locTitles = place.title;
            var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + locTitles + "&limit=1&redirects=return&format=json";

            // Wikipedia API for fetching articles on the locations. References:
            // 1.Guidelines on this page https://discussions.udacity.com/t/linking-wiki-api-to-infowindow/46966
            // 2.Guidelines on this page https://discussions.udacity.com/t/wikimedia-api-wikipedia-problem/21176
            // 3.http://stackoverflow.com/questions/34761587/about-wiki-api-and-cannot-get-proper-response-with-ajax


            var wikiRequestTimeout = setTimeout(function() {
                var wikiContent = '<h3>' + locTitles + '<li>"Failed to fetch article!"</li>';
                self.infoWindow.setContent(wikiContent);
            }, 8000);

            $.ajax({
                url: wikiUrl,
                dataType: "jsonp",
                success: function(response) {
                    var articleList = response[1];
                    //console.log(response[1]);
                    //console.log(response[2]);
                    //console.log(response[3]);

                    for (var i = 0; i < articleList.length; i++) {
                        var articleStr = articleList[i];
                        var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                        var wikiContent = '<h3>' + locTitles + '</h3>' + response[2] + '<li><a href="' + url + '">' + response[3] + '</a></li>';
                        self.infoWindow.setContent(wikiContent);
                    };

                    self.infoWindow.open(map, location.marker);
                    clearTimeout(wikiRequestTimeout);
                }
            });
        });
    });
    // Enabling marker/infoWindow to open when a list item is clicked
    self.listItem = function(place, marker) {
        google.maps.event.trigger(place.marker, 'click');
    };
    // function for filtering the locations and markers.
    // Reference:
    // The article on http://www.codeproject.com/Articles/822879/Searching-filtering-and-sorting-with-KnockoutJS-in 
    // and guidelines on the Udacity forum.
    self.search_locations = ko.observable('');
    self.filteredLocs = ko.computed(function() {
        return ko.utils.arrayFilter(self.placeList(), function(loc) {
            var filter = loc.title.toLowerCase().indexOf(self.search_locations().toLowerCase()) >= 0;
            if (filter) {
                loc.marker.setVisible(true);
            } else {
                loc.marker.setVisible(false);
            }
            return filter;

        });
    });
};
