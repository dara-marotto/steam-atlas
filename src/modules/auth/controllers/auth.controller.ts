import { Body, Controller, Post } from "@nestjs/common";
import { AuthLoginDTO } from "../dtos/auth-login.dto";
import { AuthService } from "../services/auth.service";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('login')
  async login(
    @Body() {email, password}: AuthLoginDTO
  ): Promise<{ access_token: string }> {
    
    return await this.authService.login(email, password);
  }
}