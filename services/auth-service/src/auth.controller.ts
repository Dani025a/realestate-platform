import { Body, Controller, Get, Post, Req, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { verifyJwt, signAccessToken, signRefreshToken } from "./jwt";
import { pool } from "./db";
import { randomUUID } from "crypto";

@Controller("auth")
export class AuthController {
  constructor(private svc:AuthService){}

  @Post("register")
  async register(@Body() b:{email:string; password:string}) {
    return await this.svc.register(b.email, b.password);
  }

  @Post("login")
  async login(@Body() b:{email:string; password:string}) {
    return await this.svc.login(b.email, b.password);
  }

  @Post("refresh")
  async refresh(@Body() b:{ refresh_token:string }) {
    const ver = await verifyJwt(b.refresh_token).catch(()=>{ throw new UnauthorizedException("invalid token"); });
    // @ts-ignore
    if (ver.payload.typ !== "refresh") throw new UnauthorizedException("not a refresh token");
    const sub = String(ver.payload.sub);
    const jti = String((ver.payload as any).jti);
    const r = await pool.query("SELECT user_id, revoked, expires_at FROM refresh_tokens WHERE id=$1",[jti]);
    if (r.rowCount===0) throw new UnauthorizedException("revoked");
    const row = r.rows[0];
    if (row.revoked || new Date(row.expires_at) < new Date()) throw new UnauthorizedException("revoked");
    // rotate
    await pool.query("UPDATE refresh_tokens SET revoked=true WHERE id=$1",[jti]);
    const newJti = randomUUID();
    const access = await signAccessToken(sub, "", ["user"]);
    const refresh = await signRefreshToken(sub, newJti);
    const exp = new Date(Date.now() + 30*24*60*60*1000);
    await pool.query("INSERT INTO refresh_tokens(id,user_id,expires_at) VALUES($1,$2,$3)",[newJti,sub,exp]);
    return { access_token: access, refresh_token: refresh };
  }

  @Post("logout")
  async logout(@Body() b:{ refresh_token:string }){
    const ver = await verifyJwt(b.refresh_token).catch(()=>{ throw new UnauthorizedException("invalid token"); });
    const jti = String((ver.payload as any).jti);
    await pool.query("UPDATE refresh_tokens SET revoked=true WHERE id=$1",[jti]);
    return { ok:true };
  }
}
