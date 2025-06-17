import { Snops } from '../../sdk_ts/index';

const CONTROL_PLANE_URL = (import.meta.env.VITE_CONTROL_PLANE_URL as string) || '';

export const api = new Snops(CONTROL_PLANE_URL);
