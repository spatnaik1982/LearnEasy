import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupStudentDto } from './dto/signup-student.dto';
import { SignupParentDto } from './dto/signup-parent.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup/student')
  signupStudent(@Body() dto: SignupStudentDto) {
    return this.authService.signupStudent(dto);
  }

  @Post('signup/parent')
  signupParent(@Body() dto: SignupParentDto) {
    return this.authService.signupParent(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}