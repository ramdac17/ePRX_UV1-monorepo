import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../prisma.service'; // Adjust path to your PrismaService

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService, PrismaService],
})
export class LeaderboardModule {}
