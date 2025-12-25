import dotenv from "dotenv";

dotenv.config();

export const googleOAuth = {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirectUri: process.env.GOOGLE_CALLBACK_URL as string,
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'profile', 'email']
};



export const githubOAuth = {
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    redirectUri: process.env.GITHUB_CALLBACK_URL as string,
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    userInfoEndpoint: 'https://api.github.com/user',
    emailsEndpoint: 'https://api.github.com/user/emails',
    scopes: ['user:email']
};

