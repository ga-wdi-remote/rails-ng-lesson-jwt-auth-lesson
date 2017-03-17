Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :users, only: [:create, :show, :destroy] do
    collection do
      post '/login', to: 'users#login'
      # users/login
    end
    member do
      post '/login', to: 'users#login'
      # users/:id/login
    end
  end

end
