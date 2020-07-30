import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthSignUpCredentialsDto } from './dto/auth-signup-credentials.dto';
import * as bcrypt from 'bcrypt';
import { AuthSignInCredentialsDto } from '../auth/dto/auth-signin-credentials.dto copy';
import { AuthRepository } from './auth.repository';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthRepository)
    private authRepository: AuthRepository,
  ) {}
  async signUp(credentials: AuthSignUpCredentialsDto): Promise<void> {
    const { password, confirmPassword } = credentials;
    if (password === confirmPassword) {
      try {
        await this.authRepository.signUp(credentials);
      } catch (error) {
        throw new ConflictException('Invalid Form Submission');
      }
    } else {
      throw new ConflictException('Passwords must match');
    }
  }

  async singIn(credentials: AuthSignInCredentialsDto): Promise<void> {
    const { username, password } = credentials;
    const user = await this.authRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log('logged in');
  }
}