/* eslist-disable default-param-last */
import {
  LOADER_SET, NOTIFY_SET, RESET_REDUX, USER_SET
} from '../Actions/CommonActions';

export const loader = (state = false, action) => {
  switch (action.type) {
    case LOADER_SET:
      return action.data;
    default:
      return state;
  }
};

export const notify = (state = {}, action) => {
  switch (action.type) {
    case NOTIFY_SET:
      return action.state;
    default:
      return state;
  }
};

export const user = (state = null, action) => {
  switch (action.type) {
    case USER_SET:
      return action.user;
    case RESET_REDUX:
      return null;
    default:
      return state;
  }
};

export const serviceProviderFilter = (state = { status: { id: 1, label: 'Pending', value: 'pending' }, category: null }, action) => {
  switch (action.type) {
    case 'FILTER':
      return action.status;
    default:
      return state;
  }
};
