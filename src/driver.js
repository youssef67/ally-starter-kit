import { Oauth2Driver } from '@adonisjs/ally';
export class TwitchDriver extends Oauth2Driver {
    config;
    authorizeUrl = 'https://id.twitch.tv/oauth2/authorize';
    accessTokenUrl = 'https://id.twitch.tv/oauth2/token';
    userInfoUrl = 'https://api.twitch.tv/helix/users';
    codeParamName = 'code';
    errorParamName = 'error';
    stateCookieName = 'twitch_oauth_state';
    stateParamName = 'state';
    scopeParamName = 'scope';
    scopesSeparator = ' ';
    constructor(ctx, config) {
        super(ctx, config);
        this.config = config;
        this.loadState();
    }
    accessDenied() {
        return this.ctx.request.input('error') === 'user_denied';
    }
    async user(callback) {
        const accessToken = await this.accessToken();
        const request = this.httpClient(this.config.userInfoUrl || this.userInfoUrl);
        request.header('Authorization', `Bearer ${accessToken.token}`);
        request.header('Client-ID', this.config.clientId);
        if (typeof callback === 'function') {
            callback(request);
        }
        const userResponse = await request.get();
        const [userData] = userResponse.data;
        return {
            id: userData.id,
            nickName: userData.login,
            name: userData.display_name,
            email: userData.email,
            avatarUrl: userData.profile_image_url,
            token: accessToken,
            original: userData,
            emailVerificationState: 'unsupported',
        };
    }
    async userFromToken(accessToken, callback) {
        const request = this.httpClient(this.config.userInfoUrl || this.userInfoUrl);
        request.header('Authorization', `Bearer ${accessToken}`);
        request.header('Client-ID', this.config.clientId);
        if (typeof callback === 'function') {
            callback(request);
        }
        const userResponse = await request.get();
        const [userData] = userResponse.data;
        return {
            id: userData.id,
            nickName: userData.login,
            name: userData.display_name,
            email: userData.email,
            avatarUrl: userData.profile_image_url,
            token: { token: accessToken, type: 'bearer' },
            original: userData,
            emailVerificationState: 'unsupported',
        };
    }
}
export function TwitchDriverService(config) {
    return (ctx) => new TwitchDriver(ctx, config);
}
//# sourceMappingURL=driver.js.map