function GiphyController($scope, $http, $state, $stateParams, $rootScope) {
  var self = this;
  var server = 'http://localhost:3000'

  self.savedGifs = [];

  $rootScope.$on('fetchData', function(event, data) {
    populateInitialState(data)
  });

  function populateInitialState(user) {
    $http.get(`${server}/users/${user.id}/gifs`)
      .then(function(response) {
        self.savedGifs = response.data.gifs
      })
  }

  function getSavedGifs(currentUser) {
    $http.get(`${server}/users/${currentUser.id}/gifs`)
      .then(function(response) {
        self.savedGifs = response.data.gifs
        $state.go('savedGifs', {userId: currentUser.id})
      })
  }

  function getGif() {
    $http.get('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC')
      .then(function(giphyResponse) {
        self.gifUrl = giphyResponse.data.data.image_url;

        $state.go('gif');
      })
  }

  function saveGif(url, currentUser) {
    console.log(currentUser)
    $http.post(`${server}/users/${currentUser.id}/gifs`, { url: url, name: self.name } )
      .then(function(serverResponse) {
        self.savedGifs.push(serverResponse.data.gif);
        self.name = '';
        self.gifUrl = '';

        $state.go('savedGifs', { userId: currentUser.id })
      })
  }

  function populateFormData(gif, currentUser) {
    self.url = gif.url
    self.name = gif.name

    $state.go('updateGif', {
      userId: currentUser.id,
      gifId: gif.id
    })
   }

  function updateGif(currentUser) {
    $http.put(`${server}/users/${currentUser.id}/gifs/${$stateParams.gifId}`, { name: self.name, url: self.url } )
      .then(function(giphyResponse) {
        self.savedGifs = giphyResponse.data.gifs;

        self.url = '';
        self.name = '';

        $state.go('savedGifs', { userId: currentUser.id })
      })
  }

  function deleteGif(id, currentUser) {
    console.log(id)
    $http.delete(`${server}/users/${currentUser.id}/gifs/${id}`)
      .then(function(response) {
        self.savedGifs = response.data.gifs
      })
  }

  this.getGif = getGif;
  this.saveGif = saveGif;
  this.updateGif = updateGif;
  this.populateFormData = populateFormData;
  this.getSavedGifs = getSavedGifs;
  this.deleteGif = deleteGif;
};
