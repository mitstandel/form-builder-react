export const RESET_REDUX = 'redux/RESET';
export const LOADER_SET = 'loader/SET';
export const NOTIFY_SET = 'notify/SET';
export const USER_SET = 'user/SET';

export const resetRedux = () => ({
  type: RESET_REDUX,
});

export const loaderSet = (data) => ({
  type: LOADER_SET,
  data,
});

export const notifySet = (state) => ({
  type: NOTIFY_SET,
  state,
});

export const userSet = (user) => ({
  type: USER_SET,
  user,
});

export const ServiceProviderFilterSet = (status) => ({
  type: 'FILTER',
  status,
});
