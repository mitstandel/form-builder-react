import { configureStore, createSerializableStateInvariantMiddleware } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';
import { persistReducer, persistStore } from 'redux-persist';
import reduxStorage from 'redux-persist/lib/storage';
import {
  loader, notify, user, serviceProviderFilter
} from '../Reducers/CommonReducers';

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  whitelist: ['user'],
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    loader,
    notify,
    user,
    serviceProviderFilter,
    form: reduxFormReducer,
  })
);

const middleware = [
  createSerializableStateInvariantMiddleware({
    isSerializable: (value) => typeof value !== 'function' || typeof value !== 'object',
  }),
];

const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware,
});

const persistor = persistStore(store);

export { store, persistor };
