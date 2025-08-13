import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { pool } from "./db";
import * as argon2 from "argon2";
import { randomUUID } from "crypto";
import { signAccessToken, signRefreshToken } from "./jwt";

@Injectable()
export class AuthService {
  async register(email:string, password:string){
    if(!email || !password) throw new BadRequestException("email/password required");
    const id = randomUUID();
    const hash = await argon2.hash(password);
    try{
      await pool.query("INSERT INTO users(id,email,password_hash) VALUES($1,$2,$3)",[id,email,hash]);
    }catch(e:any){
      if (String(e?.message).includes("duplicate")) throw new BadRequestException("email taken");
      throw e;
    }
    return { id, email };
  }

  async login(email:string, password:string){
    const ures = await pool.query("SELECT id,password_hash,roles FROM users WHERE email=$1",[email]);
    if (ures.rowCount===0) throw new UnauthorizedException("invalid credentials");
    const u = ures.rows[0];
    const ok = await argon2.verify(u.password_hash, password);
    if(!ok) throw new UnauthorizedException("invalid credentials");
    const access = await signAccessToken(u.id, email, u.roles ?? ["user"]);
    const jti = randomUUID();
    const refresh = await signRefreshToken(u.id, jti);
    const exp = new Date(Date.now() + 30*24*60*60*1000);
    await pool.query("INSERT INTO refresh_tokens(id,user_id,expires_at) VALUES($1,$2,$3)",[jti,u.id,exp]);
    return { access_token: access, refresh_token: refresh };
  }

  async refresh(oldRefresh:string){
    // NOTE: real verify is done in controller using jose; here rotate token
    // controller passes: userId, jti
    return;
  }

  async revokeRefresh(jti:string){
    await pool.query("UPDATE refresh_tokens SET revoked=true WHERE id=$1",[jti]);
  }
}
