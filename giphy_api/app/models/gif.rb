class Gif < ApplicationRecord
  validates :url, :name, :user_id, presence: true
  belongs_to :user
end
