class UsersController < ApplicationController

  def create

  end

  def show

  end

  def login

  end

  private

  def token(id, email)
    JWT.encode(payload(id, email), 'someawesomesecret', 'HS256')
  end

  def payload(id, email)
    {
      exp: (Time.now + 5.minutes).to_i,
      iat: Time.now.to_i,
      iss: 'wdir-matey',
      user: {
        id: id,
        email: email
      }
    }
  end

  def user_params
    params.required(:user).permit(:email, :password)
  end

end
