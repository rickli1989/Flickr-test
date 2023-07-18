// FlickrAPI.js
import axios from 'axios';

const API_KEY = 'ac889fc5021c37c353f6bb18f63cbfda';
const BASE_URL = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&format=json&nojsoncallback=1&safe_search=1&per_page=20`;

export const fetchImagesFromFlickr = (text, page) => {
  console.log(`Fetching ${BASE_URL}&text=${text}&page=${page}`);
  return axios.get(`${BASE_URL}&text=${text}&page=${page}`);
};
