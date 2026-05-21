import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalStandings() {
    // 1. Aggregate total distance from activities grouped by user
    const aggregations = await this.prisma.activity.groupBy({
      by: ['userId'],
      _sum: {
        distance: true,
      },
      orderBy: {
        _sum: {
          distance: 'desc', // 🚀 FIXED: Changed 'true' to 'desc' for valid SortOrder typing
        },
      },
    });

    // 2. Hydrate user profile data safely to attach names/avatars
    const enrichedStandings = await Promise.all(
      aggregations.map(async (item) => {
        // Skip processing if userId happens to be missing or null
        if (!item.userId) return null;

        const user = await this.prisma.user.findUnique({
          where: { id: item.userId },
          select: {
            id: true,
            firstName: true,
            image: true,
          },
        });

        return {
          userId: item.userId,
          firstName: user?.firstName || 'OPERATIVE',
          image: user?.image || null,
          totalDistance: item._sum.distance
            ? parseFloat(item._sum.distance.toString())
            : 0,
        };
      }),
    );

    // Filter out any null configurations or missing records cleanly
    return enrichedStandings.filter((standing) => standing !== null);
  }
}
