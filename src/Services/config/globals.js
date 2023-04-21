import { store } from '../Store/Store';
import { resetRedux, notifySet } from '../Actions/CommonActions';

export const USER_STORAGE_KEY = 'CIIE_USER_DATA';

export const apiUrl = (moduleKey, type) => {
  if (isEmpty(moduleKey)) {
    store.dispatch(
      notifySet({
        type: 'error',
        message: STATUS_MSG.networkError,
      })
    );
  }
  const endPoint = !isEmpty(type) ? type : 'public';
  return `${process.env.REACT_APP_BASE_URL}/${endPoint}/${moduleKey}`;
};

export const isEmpty = (obj) => (
  [Object, Array].includes((obj || {}).constructor)
  && !Object.entries(obj || {}).length
);

// STORE USER IN LOCAL STORAGE
export const storeUser = (user) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

// GET USER FROM LOCAL STORAGE
export const getUser = () => {
  const user = localStorage.getItem(USER_STORAGE_KEY);
  return user !== 'null' && !isEmpty(user) ? JSON.parse(user) : null;
};

export const clearAll = async (next) => {
  localStorage.setItem(USER_STORAGE_KEY, null);
  await next(true);
};

// REMOVE USER FROM REDUX & LOCAL STORAGE
export const userLogout = (isExpired = false) => {
  store.dispatch(resetRedux());
  storeUser(null);
  if (isExpired) {
    store.dispatch(
      notifySet({
        type: 'warning',
        message: STATUS_MSG.sessionExpired,
      })
    );
  }
};

// STATUS CODES
export const checkSuccessResponse = (statusValue) => {
  const status = [
    1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011,
    1012, 1013, 1014, 1016, 1019, 1020, 1021, 2006
  ];
  return status.includes(statusValue);
};

// CONVERT OBJECT TO QUERY STRING
export const queryString = (obj) => {
  const str = [];
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  }
  return str.join('&');
};

// GET USER TOKEN FOR API OR JUST TOKEN
export const getAuthToken = async (forAPICall = false) => {
  const AuthType = forAPICall ? 'Bearer ' : '';
  const user = await getUser();
  return AuthType + (isEmpty(user) ? '' : user.accessToken);
};

export const STATUS_CODE = {
  alreadyExistEmail: 2194,
  alreadyExistNumber: 2193,
  expiredJsonToken: 2006,
  authenticationRequired: 2093
};

export const STATUS_MSG = {
  accountNotActive: 'Your account is not active yet. Please activate your account using temp password received via email',
  sessionExpired: 'Your session has been expired',
  authenticationRequired: 'You are not authorised to view this page',
  uploadLogo: 'Please upload your logo',
  allFieldsMandatory: 'All fields are mandatory',
  endDateGreater: 'Please select end date greater than start date',
  serviceProviderRequired: 'Please select atleast one service provider',
  networkError: 'Network request error. Please try again.',
  passwordChanged: 'Your password has been successfully changed.'
};

// GET USER TOKEN FOR API OR JUST TOKEN
export const getAuthRefreshToken = async (forAPICall = false) => {
  const AuthType = forAPICall ? 'Bearer ' : '';
  const user = await getUser();
  return AuthType + (isEmpty(user) ? '' : user.refreshToken);
};

export const convertFormData = async (data) => {
  const formData = new FormData();
  buildFormData(formData, data);
  return formData;
};

export const buildFormData = (formData, data, parentKey) => {
  if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
    Object.keys(data).forEach((key) => {
      buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
    });
  } else {
    const value = data == null ? '' : data;
    formData.append(parentKey, value);
  }
};

export const toFloat = (value, fractionDigits = 2) => {
  const digit = typeof fractionDigits === 'number' ? fractionDigits : 2; // because of sometimes get in string
  const data = typeof value === 'number'
    ? value.toFixed(digit)
    : Number.parseFloat(isEmpty(value) ? 0 : value).toFixed(digit);
  return data === 0 ? 0 : data;
  // data == 0 because of some time get EX. -12.00, 0, 0.67 and undefined
};

export const idleLogout = () => {
  const duration = 900000; // 900000ms = 15 minutes

  window.addEventListener('scroll', resetTimer, true);
  window.addEventListener('load', resetTimer);
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('mousedown', resetTimer); // catches touchscreen presses as well
  window.addEventListener('touchstart', resetTimer); // catches touchscreen swipes as well
  window.addEventListener('touchmove', resetTimer); // required by some devices
  window.addEventListener('click', resetTimer); // catches touchpad clicks as well
  window.addEventListener('keydown', resetTimer);

  const logoutAndRemoveTimer = () => {
    userLogout(true);
    window.removeEventListener('scroll', resetTimer, true);
    window.removeEventListener('load', resetTimer);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('mousedown', resetTimer);
    window.removeEventListener('touchstart', resetTimer);
    window.removeEventListener('touchmove', resetTimer);
    window.removeEventListener('click', resetTimer);
    window.removeEventListener('keydown', resetTimer);
  };

  function resetTimer() {
    clearTimeout(window.idleTimeoutId);
    window.idleTimeoutId = setTimeout(logoutAndRemoveTimer, duration);
  }

  resetTimer();
};

export const privateReqHeaders = async () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: await getAuthToken(true),
  refreshToken: await getAuthRefreshToken(true),
});

export const publicReqHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json'
});

export const validateAuthResponse = async (response) => {
  if (response.status !== 200) {
    throw new TypeError('Network Error');
  }
  const jsonResponse = await response.data;

  // Update access token
  if (
    jsonResponse.hasOwnProperty('accessToken')
    && jsonResponse.accessToken !== null
  ) {
    const user = await getUser();
    if (user !== null) {
      user.accessToken = jsonResponse.accessToken;
      storeUser(user);
    }
  }
  jsonResponse.status = false;

  const isSuccess = checkSuccessResponse(jsonResponse.code); // custom success codes from backend

  if (isSuccess === true) {
    jsonResponse.status = true;
  } else if (jsonResponse.code === STATUS_CODE.expiredJsonToken) {
    await userLogout();
  } else {
    jsonResponse.status = -1;
  }
  return jsonResponse;
};

export const validateFileResponse = async (response) => {
  const type = response.headers['content-type'];
  const blob = new Blob([response.data], { type, encoding: 'UTF-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `XL-${response.headers['last-modified']}.xlsx`;
  link.click();
};

// GET SPECIFIC OBJECT VALUE IN ARRAY
export const getFields = (input, field) => {
  const output = [];
  for (let i = 0; i < input.length; ++i) output.push(input[i][field]);
  return output;
};

// USE --- const NAME = getFields(ARRAY, 'FIELD NAME');
export const fromEpochToDate = (epoch) => {
  const date = new Date(epoch * 1000);
  const year = date.getFullYear();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};

export const fromEpochToDateWithMonthName = (epoch) => {
  const date = new Date(epoch * 1000);
  const year = date.getFullYear();
  const day = date.getDate().toString().padStart(2, '0');
  const month = new Date(epoch * 1000).toLocaleDateString('en', { month: 'short' });
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};
