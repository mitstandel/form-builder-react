import axios from 'axios';
import { loaderSet, notifySet } from './Actions/CommonActions';
import {
  convertFormData, getAuthRefreshToken, getAuthToken, STATUS_CODE, STATUS_MSG, userLogout, validateAuthResponse, validateFileResponse
} from './config/globals';
import { store } from './Store/Store';

class AxiosService {
  constructor() {
    this.instance = axios.create({
      baseURL: `${process.env.REACT_APP_BASE_URL}`
    });

    this.instance.interceptors.request.use(async (config) => {
      let headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      };

      if (config.url.includes('upload-image')) {
        headers = {
          Accept: 'application/json'
        };
        config.data = await convertFormData(config.data);
      }
      if (config.url.includes('upload-excel')) {
        headers = {
          Accept: 'application/json'
        };
        config.data = await convertFormData(config.data);
      }

      if (config.url.includes('private')) {
        headers.Authorization = await getAuthToken(true);
        headers.refreshToken = await getAuthRefreshToken(true);
      }

      // Add a custom header
      config.headers = headers;

      return config;
    }, (error) => Promise.reject(error));

    this.instance.interceptors.response.use(
      async (response) => {
        let responseData = null;
        if (response.config.url.includes('download')) {
          responseData = await validateFileResponse(response);
        } else {
          responseData = await validateAuthResponse(response);
        }
        return responseData;
      },
      (error) => {
        if (error.response.data.code === STATUS_CODE.expiredJsonToken
          || error.response.data.code === STATUS_CODE.authenticationRequired) {
          userLogout(true);
        }
        store.dispatch(loaderSet(false));
        store.dispatch(
          notifySet({
            type: 'error',
            message: STATUS_MSG.networkError,
          })
        );
        // Handle errors
        return Promise.reject(error);
      }
    );
  }

  get(url, config = {}) {
    return this.instance.get(url, config);
  }

  post(url, data = {}, config = {}) {
    return this.instance.post(url, data, config);
  }

  put(url, data = {}, config = {}) {
    return this.instance.put(url, data, config);
  }

  delete(url, config = {}) {
    return this.instance.delete(url, config);
  }
}

export default new AxiosService();
