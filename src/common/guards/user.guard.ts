import { Reflector } from '@nestjs/core';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.body.user;

    const noCheck = this.reflector.get<string[]>(
      'no-user',
      context.getHandler(),
    );

    if (noCheck) {
      return true;
    }

    if (request.method !== 'POST') {
      return true;
    }

    if (user) {
      return true;
    }

    throw new UnauthorizedException('Field, need user but none ');
  }
} 