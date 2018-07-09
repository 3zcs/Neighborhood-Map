var map = null;  
/* the model */
var place = function(data) {
  var self = this  
  self.name = ko.observable(data.name);
  self.lat = ko.observable(data.location.lat);
  self.lng = ko.observable(data.location.lng);
  self.city = ko.observable(data.location.city);
  self.state = ko.observable(data.location.state);
  self.country = ko.observable(data.location.country);
};

function initMap() {
  var mark = {lat: 40.749526 , lng: -74.0009934}
  map = new google.maps.Map(document.getElementById('map-container'), {
    center: mark,
    zoom: 12
  });
}

function MapViewModel(){
  var self = this;
  self.map;
  self.userSearch = ko.observable("mountain view");
  self.locations = ko.observableArray([]);
  self.markers = ko.observableArray([]);

  /*
  handleing user request for Neighborhood
  */
  self.findNeighborhood = function(){
    self.removeAllUnselectedLocations();
    if (self.userSearch() != null && self.userSearch() != "") {      
      $.ajax({url: places(self.userSearch()), success: function(result){        
            self.jsonParsing(result);
            self.addMarkers();
          },
          error: function(){            
            self.locations.push({name:"something wrong, No result..!"});
          }});
        }
  };

  //parse json and change map center to choosen Neighborhood 
  self.jsonParsing = function (result) {
    console.log(result);
    self.changeCenter(result.response.geocode.feature.geometry.center.lat ,result.response.geocode.feature.geometry.center.lng);
    var venues = result.response.venues;
    for (var i = 0; i < venues.length; i++) {
      this.locations.push(new place(venues[i]));
    }
  };

  //change map center
  self.changeCenter = function(lat, lng){
    self.map = map;
    var center = new google.maps.LatLng(lat, lng);
    self.map.panTo(center);
    self.map.setZoom(16);
    }
   
  //request places from a choosen Neighborhood, foursquare API
  var places = function(location_name) {
    var places_url = "https://api.foursquare.com/v2/venues/search";
    places_url += "?" + $.param({
    	"client_id": "1BK4KLOORY501T3ZZSRHZZCJSC5QHICMEIY4QVNWCCCUZS5E",
    	"client_secret": "MYKZW0FN5TMQ1RHOMMAO3LGZBWOFULALDDOTCDL1S0DWZS3L",
    	"near": location_name,
    	"v": "20180611"
    });
    return places_url;
  };

  //add marker with infowindow 
  self.addMarkers = function(markerIcon=""){
    var infowindow = new google.maps.InfoWindow();
    var marker, i;
    // The following group uses the location array to create an array of markers on initialize.
  for (i = 0; i < self.locations().length; i++) {   
    // Get the position from the location array.
    var position = {lat: self.locations()[i].lat(), lng: self.locations()[i].lng()};

    var title = self.locations()[i].name();
          marker = new google.maps.Marker({
          position: {lat: self.locations()[i].lat(), lng: self.locations()[i].lng()},
          title: self.locations()[i].name(),
          animation: google.maps.Animation.DROP,
          id: i,
          map: map,
          icon: markerIcon
          });
    
          google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
              infowindow.setContent(getContent(self.locations()[i]));
              infowindow.open(map, marker);
            }
          })(marker, i));
        

    // Push the marker to our array of markers.
    self.markers.push(marker);


    }
  };

  //content of infowindow
  var getContent = function(place){
    return `<h7>${place.name()}<br/>
    ${place.city() ? place.city()+'<br/>' : '' }
    ${place.state() ? place.state()+'<br/>' : '' }
    ${place.country()}<br/>
    lat,lng: ${place.lat()} ${place.lng()}</h7>`;
  }

  self.selectMarker = function(userSearch){
    if(userSearch instanceof place){
    self.removeAllUnselectedLocations();
    self.addSelectedLocation(userSearch);
  }
  }

  self.removeAllUnselectedLocations = function(){
    self.locations.removeAll();
    self.removeAllMarkers();
    self.markers.removeAll();
  };

  self.addSelectedLocation = function(location){
    self.locations.push(location);
    self.addMarkers('https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png');
  };


  self.removeAllMarkers = function(){
    for(var j = 0; j < self.markers().length; j++) 
      self.markers()[j].setMap(null);
  };
}

MapViewModel.onClick = function (contact) {
  alert(contact.Name);
}

var vm = new MapViewModel();
ko.applyBindings(vm);
$(function(){
    vm.findNeighborhood(); 
});