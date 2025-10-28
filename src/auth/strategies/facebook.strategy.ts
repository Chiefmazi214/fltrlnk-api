import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";
import { FacebookProfile } from "../dtos/facebook-profile.dto";
import { AuthService } from "../auth.service";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: process.env.FB_OAUTH_CALLBACK_URI,
      scope: "email",
      profileFields: ["emails", "name"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: FacebookProfile,
    done: (err: any, user: any, info?: any) => void
  ): Promise<any> {
    const user = await this.authService.findOrCreateFacebookUser(profile);
    done(null, user);
  }
}