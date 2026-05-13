class NotificationLog < ApplicationRecord
  belongs_to :user

  validates :identifier, presence: true
  validates :title, presence: true
  validates :body, presence: true
  validates :scheduled_for, presence: true
  validates :identifier, uniqueness: { scope: :user_id }
end
