import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { verifyJwt } from "./jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(ctx:ExecutionContext){
    const req = ctx.switchToHttp().getRequest();
    const h = req.headers["authorization"] ?? "";
    const tok = h.startsWith("Bearer ") ? h.slice(7) : "";
    if(!tok) throw new UnauthorizedException();
    await verifyJwt(tok).catch(()=>{ throw new UnauthorizedException(); });
    return true;
  }
}
