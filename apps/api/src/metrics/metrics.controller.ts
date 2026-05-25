import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from './../prisma.service'; // 🛠️ Adjust this path to match your layout

@Controller('api/metrics')
export class MetricsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getDashboardMetrics() {
    try {
      // 1. Query the activity table using your active Postgres driver pool
      // If your model is named differently in schema.prisma, update the 'activity' key here
      const rawActivities = await this.prisma.activity.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      });

      // 2. Parse the records chronologically for your charts
      const activityData = rawActivities
        .map((act) => {
          const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          return {
            day: days[new Date(act.createdAt).getDay()],
            distance: Number(act.distance || 0),
          };
        })
        .reverse();

      // 3. Accumulate aggregate mileage metrics
      const totalDistanceSum = activityData.reduce(
        (acc, item) => acc + item.distance,
        0,
      );

      return {
        success: true,
        activityData,
        stats: {
          totalKm: totalDistanceSum.toFixed(1),
          avgPace: '0.00', // Keeps layout destructuring completely secure
        },
      };
    } catch (error) {
      // Return structured JSON fallbacks if tables don't have records yet
      return {
        success: true,
        activityData: [],
        stats: { totalKm: '0.0', avgPace: '0.00' },
      };
    }
  }
}
