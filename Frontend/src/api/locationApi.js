import * as regionApi from "./regionApi";
import * as cityApi from "./cityApi";

export const getRegions = regionApi.getRegions;
export const getCitiesByRegion = cityApi.getCitiesByRegion;

export const admin = {
  getRegions: regionApi.getAdminRegions,
  createRegion: regionApi.createRegion,
  updateRegion: regionApi.updateRegion,
  deleteRegion: regionApi.deleteRegion,
  toggleRegionStatus: regionApi.toggleRegionStatus,

  getCities: cityApi.getAdminCities,
  createCity: cityApi.createCity,
  updateCity: cityApi.updateCity,
  deleteCity: cityApi.deleteCity,
  toggleCityStatus: cityApi.toggleCityStatus,
};

export default { getRegions, getCitiesByRegion, admin };

