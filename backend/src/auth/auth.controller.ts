import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUsername } from '../common/current-user.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('authentication')
@Controller('users')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  async login(@Body() request: LoginDto): Promise<{ access_token: string }> {
    const accessToken = await this.auth.getAccessToken(request.username, request.password);
    return { access_token: accessToken };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUsername() username: string,
    @Body() request: ChangePasswordDto,
  ): Promise<null> {
    await this.auth.changePassword(username, request);
    return null;
  }
}
