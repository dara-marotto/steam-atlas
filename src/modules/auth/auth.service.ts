import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserPayload } from "../auth/interfaces/user-payload.interface";
import { UserEntity } from "../user/entities/user.entity";
import { UserService } from "../user/services/user.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string }> {
    const user = await this.validateUser(email, password);

    if(!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: UserPayload = {
      sub: user.id,
      email: user.email
    }
  
    return {
      access_token: this.jwtService.sign(payload)
    }
  }

  private async validateUser(
    email: string,
    password: string
  ): Promise<UserEntity | false> {
    const user = await this.userService.indexOne(email);

    const authenticatedUser = await bcrypt.compare(
      password, user.password
    );

    return authenticatedUser ? user : false;
  }
}