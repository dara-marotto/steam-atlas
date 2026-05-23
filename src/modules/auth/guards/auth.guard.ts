import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import { UserPayload } from "../interfaces/user-payload.interface";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService
  ) {}

  private extractTokenFromHeader(
    req: Request
  ): string | undefined {

    const authHeader = req.headers['authorization'];

    if(!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);
    if(!token) throw new UnauthorizedException('No token provided');

    try {
      const payload: UserPayload = await this.jwtService.verifyAsync(token);
      request.user = payload;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

}