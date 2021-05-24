class PropertiesController < ApplicationController

  def index
    @properties = params[:properties]
  end
end
