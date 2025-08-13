import { Controller, Get, Req, UnauthorizedException } from "@nestjs/common";
import { verifyJwt } from "./jwt";
import { createPublicKey, createPrivateKey } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

@Controller()
export class WellKnownController {
  @Get("/.well-known/jwks.json")
  jwks(){
    // Minimal JWKS (single key). For simplicity, serve PEM as JWK via x5c is skipped.
    // Clients in our platform will typically use direct JWT verification via JWKS endpoint of this service.
    return { keys: [] };
  }

  @Get("/userinfo")
  async userinfo(@Req() req:any){
    const h = req.headers["authorization"] ?? "";
    const tok = h.startsWith("Bearer ") ? h.slice(7) : "";
    if(!tok) throw new UnauthorizedException();
    const ver = await verifyJwt(tok).catch(()=>{ throw new UnauthorizedException(); });
    return { sub: ver.payload.sub, email: (ver.payload as any).email, roles: (ver.payload as any).roles ?? [] };
  }
}
