import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from './../prisma.service'; // Adjust path to your file above

@Controller('api/metrics')
export class MetricsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getDashboardMetrics() {
    const rawActivities = await this.prisma.activity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    const activityData = rawActivities
      .map((act) => {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return {
          day: days[new Date(act.createdAt).getDay()],
          distance: Number(act.distance || 0),
        };
      })
      .reverse();

    const totalDistanceSum = activityData.reduce(
      (acc, item) => acc + item.distance,
      0,
    );

    return {
      success: true,
      activityData,
      stats: {
        totalKm: totalDistanceSum.toFixed(1),
        avgPace: '0.00',
      },
    };
  }
}
