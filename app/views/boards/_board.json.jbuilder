json.extract! board, :id, :username, :created_at, :updated_at
json.url board_url(board, format: :json)
