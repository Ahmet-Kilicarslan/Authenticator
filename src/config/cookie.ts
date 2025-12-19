




/*

  import {AUTH_COOKIE_CONFIG,AUTH_COOKIE_NAME} from '../config/cookie'

  cookie creation -> res.cookie(AUTH_COOKIE_NAME, result.token,AUTH_COOKIE_CONFIG);

  */

export const AUTH_COOKIE_CONFIG = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',//false
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000
};

export const AUTH_COOKIE_NAME = 'authToken';

