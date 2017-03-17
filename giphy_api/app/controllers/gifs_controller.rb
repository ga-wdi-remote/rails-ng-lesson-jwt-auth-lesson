class GifsController < ApplicationController

  def index
    gifs = current_user.gifs

    render json: {status: 200, gifs: gifs}
  end

  def create
    gif = current_user.gifs.new(gif_params)

    if gif.save
      render json: { status: 201, gif: gif}
    else
      render json: { status: 422, user: gif.errors}
    end
  end

  def update
    gif = Gif.find(params[:id])
    gif.update(gif_params)

    render json: { status: 200, gifs: current_user.gifs }
  end

  def destroy
    Gif.destroy(params[:id])

    render json: {status: 204, message: 'resource deleted succesfully', gifs: current_user.gifs}
  end


  private


    def gif_params
      params.required(:gif).permit(:name, :url, :user_id)
    end
end
