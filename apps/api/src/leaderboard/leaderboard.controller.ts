import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
// Adjust these paths to match your existing auth guard file locations
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Leaderboard')
@ApiBearerAuth('JWT-auth')
@Controller('leaderboard')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller with JWT authentication
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve global operative standings ranked by total distance',
  })
  async getGlobalLeaderboard() {
    return this.leaderboardService.getGlobalStandings();
  }
}
