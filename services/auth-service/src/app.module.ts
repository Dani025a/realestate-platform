import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { WellKnownController } from "./wellknown.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController, WellKnownController],
  providers: [AuthService]
})
export class AppModule {}
