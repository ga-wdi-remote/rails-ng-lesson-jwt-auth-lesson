function AuthController($http, $state, $scope, $rootScope) {
  var self = this;

  function signup(userPass) {
    $http.post(`/users`, userPass )
      .then(function(response) {
        $state.go('login');
      });
  }

  function login(userPass) {
    $http.post(`/users/login`, userPass )
      .then(function(response) {

        $scope.$emit('userLoggedIn', response.data.user);
        $rootScope.$emit('fetchData', response.data.user);
        $state.go('gif');
    });
  }

  function logout() {

    $scope.$emit('userLoggedOut');
    $state.go('index');
  }

  this.signup = signup;
  this.login = login;
  this.logout = logout;
}
