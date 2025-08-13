import { createPrivateKey, createPublicKey } from "crypto";
import { SignJWT, jwtVerify, exportJWK, importPKCS8, JWK, generateKeyPair } from "jose";
import { randomUUID } from "crypto";
import { cfg } from "./config";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

const KEYS_DIR = join(__dirname, "..", "keys");
const PRIV_PATH = join(KEYS_DIR, "private.pem");
const PUB_PATH  = join(KEYS_DIR, "public.pem");
let kid = "dev-key";

function ensureKeys(){
  if (!existsSync(PRIV_PATH) || !existsSync(PUB_PATH)) {
    // Generate dev RSA keypair
    // Note: this is DEV ONLY; in prod load from secret manager
    const { privateKey, publicKey } = require("node:crypto").generateKeyPairSync("rsa", { modulusLength: 2048 });
    writeFileSync(PRIV_PATH, privateKey.export({ type: "pkcs1", format: "pem" }));
    writeFileSync(PUB_PATH,  publicKey.export({ type: "pkcs1", format: "pem" }));
  }
}
ensureKeys();

function getKeys(){
  const privPem = readFileSync(PRIV_PATH, "utf8");
  const pubPem  = readFileSync(PUB_PATH, "utf8");
  const privateKey = createPrivateKey(privPem);
  const publicKey  = createPublicKey(pubPem);
  return { privateKey, publicKey };
}

export async function signAccessToken(sub:string, email:string, roles:string[]){
  const { privateKey } = getKeys();
  return await new SignJWT({ email, roles })
    .setProtectedHeader({ alg:"RS256", kid })
    .setSubject(sub)
    .setIssuer(cfg.JWT_ISSUER)
    .setAudience(cfg.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(privateKey);
}

export async function signRefreshToken(sub:string, jti:string){
  const { privateKey } = getKeys();
  return await new SignJWT({ typ:"refresh", jti })
    .setProtectedHeader({ alg:"RS256", kid })
    .setSubject(sub)
    .setIssuer(cfg.JWT_ISSUER)
    .setAudience(cfg.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(privateKey);
}

export async function verifyJwt(token:string){
  const { publicKey } = getKeys();
  return await jwtVerify(token, publicKey, { issuer: cfg.JWT_ISSUER, audience: cfg.JWT_AUDIENCE });
}

export function getJwks(): { keys: JWK[] } {
  const { publicKey } = getKeys();
  const jwk = (publicKey as any).export ? (publicKey as any).export({ format: "jwk" }) : null;
  if (jwk) { (jwk as any).kid = kid; (jwk as any).alg = "RS256"; (jwk as any).use = "sig"; return { keys: [jwk] as any}; }
  // Fallback: compute JWK via JOSE
  const pubPem  = readFileSync(PUB_PATH, "utf8");
  const cryptoKey = createPublicKey(pubPem);
  // @ts-ignore
  return { keys: [] };
}
