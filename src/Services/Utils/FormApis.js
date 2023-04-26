import AxiosService from '../AxiosService';

export const getForms = async (data) => AxiosService.post(`/form/list-forms.json`, data);

export const checkAPIKey = async (data) => AxiosService.post(`/check-api-key.php`, data);
