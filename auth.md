---
title: Authentication
type: lesson
duration: Full Day
creator:
    name: Colin Hart
    campus: WDIR
competencies: Programming
---

# Lesson Objectives

- Install pry-rails, bcrypt, and jwt-ruby
- Implement json web tokens(JWT) for authentication
- Hash user passwords and decrypt them using bcrypt
- Implement $window.localStorage on the front end
- pass Authorization / Bearer tokens using $http and angular interceptors

## The set up

1. Add `has_secure_password` to the users model user model

2. Uncomment or add `gem bcrypt` in the Gemfile and then add:

  ```
  gem 'jwt'
  gem 'pry-rails'
  ```

  Finally run

  $`bundle install`

2. Look at the migration in the migrations directory, and then run `rails db:create db:migrate`

3. Read the routes.rb file, run `rails routes` and look up what collection routes are in Rails

  ```ruby
    resources :users, only: [:create, :show, :destroy] do
     collection do
       post '/login', to: 'users#login'
     end
   end
  ```

  BONUS: What are member routes?

## The Routes

We're going to add a login route to our `users_controller`

  ```ruby
  def login
      user = User.find_by(email: params[:user][:email])

      if user && user.authenticate(params[:user][:password])
        render json: {status: 201, user: user}
      else
        render json: {status: 401, message: "unauthorized"}
      end
    end
  ```

Let's test this.

Where does the `.authenticate` method come from?

Read [has_secure_password](http://api.rubyonrails.org/classes/ActiveModel/SecurePassword/ClassMethods.html#method-i-has_secure_password)

So we can login but the question is how do we keep track of Logged in users?

How have we done this in the past?

## Tokens

Reading time! [JWT tokens](https://jwt.io/introduction/) (10m)

From the [gems documentation](https://github.com/jwt/ruby-jwt)

Add

```
  token = token(user.id, user.email)
```
In the if statement after you authenticate your user to trigger the following token generation process

```ruby
def token(id, username)
  JWT.encode(payload(id, email), 'derderdercats', 'HS256')
end

def payload(id, email)
  {
    exp: (Time.now + 1.day).to_i # Expiration date 24 hours from now
    iat: Time.now.to_i,
    iss: ENV['JWT_ISSUER'],
    user: {
      id: id,
      email: email
    }
  }
```

SIDENOTE: DateTime in Rails is ridiculously good.

run `rails -D time` read the response. To see the time zone names run `rails time:zones[US]`

Add this to `application.rb` if you're on EST, use the appropriate name for where you are.

```rb
class Application < Rails::Application
  config.time_zone = 'Eastern Time (US & Canada)'
end
```

Now will also work for expiration

```rb
1.day.from_now
```

## Authentication methods

You might have noticed that there are a ton of methods in the Application Controller.

In breakout rooms work with your partner for 45 minutes to breakdown what each method does.

Write your answers by commenting each line in the ApplicationController and writing an overall summary of each method on the lines above.

Why are they in the ApplicationController?

HINT: Use the ruby docs, the jwt-ruby documentation, and google to help.

```ruby
class ApplicationController < ActionController::API
  def authenticate
    render json: {status: 401, message: "unauthorized"} unless decode_token(bearer_token)
  end

  def authorize
    render json: {status: 401, message: "unauthorized"} unless current_user.id == params[:id].to_i
  end

  def bearer_token
    pattern = /^Bearer /
    header  = request.env["HTTP_AUTHORIZATION"] # <= env
    header.gsub(pattern, '') if header && header.match(pattern)
  end

  def current_user
    return if !bearer_token

    decoded_jwt = decode_token(bearer_token)

    @current_user ||= User.find(decoded_jwt["user"]["id"])
  end

  def decode_token(token)
    @token ||= JWT.decode(token, nil, false)[0]

  rescue
    render json: {status: 401, message: 'invalid or expired token'}
  end
end
```

## Passing tokens via postman

![](postman.png)

Under headers:

The key is `Authorization` the value is `Bearer <token>`

Let's test.

## Authorization

We have an authenticate method in our ApplicationController meaning every controller inherits that method.

How can we use that method to restrict access to our application.

Read about controller [filters](http://guides.rubyonrails.org/action_controller_overview.html#filters): http://guides.rubyonrails.org/action_controller_overview.html#filters


SIDENOTE: Active Record [callbacks](http://api.rubyonrails.org/classes/ActiveRecord/Callbacks.html)


The before_action will call the authenticate method before every controller action. Unless you specify otherwise

Add the following line to the top of your UsersController:

```
before_action :authorize, except: [:login, :create]
```


# The Angular Portion!

Take 20 minutes to read through the front end source code. Ask any and all questions you might have about it.

## Factories!

Remember Factories and services? We're going to build some factories to handle our tokens and then implement http interceptors.

Just like with pubsub, my hope is that even though we're only implementing this for Auth you'll find many more useful scenarios to use this!

You'll notice two empty files in the scripts/factories directory.

## localStorage

[MDN docs on localstorage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)

Run localStorage in your developer console

```
$ localStorage
$ localStorage.setItem('foo', JSON.stringify({user: 'colin'})
$ localStorage
$ localStorage.getItem('foo')
$ JSON.parse(localStorage.getItem('foo'))
```

```js
function AuthTokenFactory($window){
  var store = $window.localStorage;
  var key = 'auth-token';

  return {
    getToken: getToken,
    setToken: setToken
  }

  function getToken() {
    return store.getItem(key)
  }

  function setToken(token) {
    if (token) {
      store.setItem(key, token)
    } else {
      store.removeItem(key)
    }
  }
}
```

We'll now inject this factory into the AuthController

```js
function AuthController($http, $state, $scope, $rootScope, AuthTokenFactory) {
  [...]
}
```

When our token is returned from the API we save it to local storage, so in subsequent requests we can pass it in the Authorization header.

```js
function login(userPass) {
    $http.post(`${server}/users/login`, { user: userPass } )
      .then(function(response) {
        AuthTokenFactory.setToken(response.data.token)

        $scope.$emit('userLoggedIn', response.data.user);
        $rootScope.$emit('fetchData', response.data.user);
        $state.go('gif');
    });
  }
```

To logout:

```js
  function logout() {
    AuthTokenFactory.setToken();

    $scope.$emit('userLoggedOut');
    $state.go('index');
  }
```

## Interceptors!

Interceptors are pretty fancy. You can kind of think of them as being similar to the middle ware we used in Units 2 and 3.

With a little configuration we'll write some code that will run before every http request gets sent from `$http`.

Remember the token is how the server will identify whether a user is logged in or not.

Without writing an interceptor we'd have to pass our bearer token in this way each time:

```js
$http.post(`${rootUrl}/gifs`, { gif: newGif }, {
   headers: {
     'Authorization': 'Bearer ' + JSON.parse(AuthTokenFactory.getToken())
   }
 })
 ```

 But we're lazy, and that's going to turn our codebase into some WET
 (Write Everything Twice) code.

 So let's dry it out ahead time with interceptors

 In `auth_interceptor.js` add this code

 ```js
  function AuthInterceptor(AuthTokenFactory) {
    return {
      request: addToken
    }

    function addToken(config){
      var token = AuthTokenFactory.getToken();

      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config
    }
  }
  ```

  And add this code to your router.js file

  ```js
    .config(authInterceptor);

    function authInterceptor($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    }
  ```

  Your first three lines of router.js will now look like this:

  ```js
    angular.module('giphyAngularApp', ['ui.router'])
    .config(GiphyRouter)
    .config(authInterceptor);
  ```

## Further reading

- https://blog.thoughtram.io/angular/2015/07/07/service-vs-factory-once-and-for-all.html
- https://toddmotto.com/factory-versus-service
- https://nathanleclaire.com/blog/2014/03/15/angularjs-isnt-mvc-its-sdc/
- http://blog.teamtreehouse.com/its-time-to-httparty
