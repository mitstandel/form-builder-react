import AxiosService from '../AxiosService';

export const getForms = async (data) => AxiosService.post(`/form/list-forms.json`, data);
