import type {Request, Response} from 'express';
import SessionService from '../services/SessionService.js';
import OauthService from "../services/OauthService";
import crypto from "crypto";
import {googleOAuth,githubOAuth} from "../config/oslo.js"
import { AUTH_COOKIE_CONFIG, AUTH_COOKIE_NAME ,OAUTH_COOKIE_NAME} from '../config/cookie.js';
class OAuthController {


    constructor(
        private sessionService: SessionService,
        private oauthService: OauthService,
    ) {
    }

    private generateState(): string {

        return crypto.randomBytes(32).toString('hex');
    }

    private buildAuthorizationURL(endpoint: string, params: Record<string, string>): string {
        const url = new URL(endpoint);

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        return url.toString();


    }

    private async exchangeCodeForToken(tokenEndpoint:string,params :Record<string, string>): Promise<any> {

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams(params)
        });

        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.statusText}`);
        }

        return await response.json();

    }

    private async fetchUserInfo(
        userInfoEndpoint: string,
        accessToken: string
    ): Promise<any> {
        const response = await fetch(userInfoEndpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user info: ${response.statusText}`);
        }

        return await response.json();
    }

    async initiateGoggleLogin(_req: Request,res:Response): Promise<void> {
        try{
             const state = this.generateState();

             res.cookie(OAUTH_COOKIE_NAME, state, {
                 httpOnly: true,
                 secure: false,
                 maxAge: 600000,
                 sameSite: 'lax'
             });

            const authUrl = this.buildAuthorizationURL(
                'https://accounts.google.com/o/oauth2/v2/auth',
                {
                    client_id: googleOAuth.clientId,
                    redirect_uri: googleOAuth.redirectUri,
                    response_type: 'code',
                    scope: 'openid profile email',
                    state: state
                }
            );

            res.redirect(authUrl);

        }catch(error){

            res.redirect(`${process.env.FRONTEND_URL}/login?error=google_init_failed`);
        }


    }

    async handleGoogleCallback(req: Request, res: Response): Promise<void> {
        try{
            const code = req.query.code as string;
            const state = req.query.state as string;
            const storedState = req.cookies.oauth_state;


            if (!code || !state || !storedState || state !== storedState) {
                res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
                return;
            }

            const tokenData = await this.exchangeCodeForToken(
                googleOAuth.tokenEndpoint,
                {
                    code: code,
                    client_id: googleOAuth.clientId,
                    client_secret: googleOAuth.clientSecret,
                    redirect_uri: googleOAuth.redirectUri,
                    grant_type: 'authorization_code'
                }
            );

            const googleUser = await this.fetchUserInfo(
                googleOAuth.userInfoEndpoint,
                tokenData.access_token
            )
            if (!googleUser.email) {
                res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
                return;
            }

            const user = await this.oauthService.handleOauthUser(
                googleUser.sub,
                'google',
                googleUser.name ?? googleUser.email.split('@')[0],
                googleUser.email
            );

            const token = await this.sessionService.createSession({
                userId: user.id,
                email: user.email,
                permissions: [],
                roles: []
            });

            res.clearCookie('oauth_state');

            res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_CONFIG);

            res.redirect(`${process.env.FRONTEND_URL}/Profile`);


        }catch(error){

            console.error('❌ Google OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
        }

    }

    async initiateGithubLogin(_req: Request, res: Response): Promise<void> {
       try {
           const state = this.generateState();

           res.cookie(OAUTH_COOKIE_NAME, state, AUTH_COOKIE_CONFIG);

           const authUrl = this.buildAuthorizationURL(
               githubOAuth.authorizationEndpoint,
               {
                   client_id: githubOAuth.clientId,
                   redirect_uri: githubOAuth.redirectUri,
                   response_type: 'code',
                   scope: githubOAuth.scopes.join(' '),
                   state: state

               }
           )
           res.redirect(authUrl);
       }catch(error){
           res.redirect(`${process.env.FRONTEND_URL}/login?error=google_init_failed`);
       }

    }


    async handleGithubCallback(req: Request, res: Response): Promise<void> {

        try{
            const code = req.query.code as string;
            const state = req.query.state as string;
            const storedState = req.cookies.oauth_state;


            if (!code || !state || !storedState || state !== storedState) {
                res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
                return;
            }

            const tokenData = await this.exchangeCodeForToken(

                githubOAuth.tokenEndpoint,
                {
                    code: code,
                    client_id: githubOAuth.clientId,
                    client_secret: githubOAuth.clientSecret,
                    redirect_uri: githubOAuth.redirectUri,
                    grant_type: 'authorization_code'
                }
            )

            const githubUser = await this.fetchUserInfo(githubOAuth.userInfoEndpoint, tokenData.access_token);

            if (!githubUser) {
                res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
                return;
            }

            const user = await this.oauthService.handleOauthUser(
                String(githubUser.id),
                'github',
                githubUser.name ?? githubUser.email.split('@')[0],
                githubUser.email
            );

            const token = await this.sessionService.createSession({
                userId: user.id,
                email: user.email,
                permissions: [],
                roles: []
            })

            res.clearCookie(OAUTH_COOKIE_NAME);

            res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_CONFIG);

            res.redirect(`${process.env.FRONTEND_URL}/Profile`);


        }catch(error){
            console.error('❌ Google OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
        }

    }


}

export default OAuthController;