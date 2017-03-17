function AuthInterceptor(AuthTokenFactory) {
  return {
    request: addToken
  }

  function addToken(config) {
    var token = AuthTokenFactory.getToken()

    if (token && config.url !== 'http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC') {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  }
}
