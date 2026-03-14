import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDashboardStats(userId: string) {
    // 1. Fetch all activities for this user
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Calculate totals using reduce
    const totals = activities.reduce(
      (acc, curr) => ({
        distance: acc.distance + (curr.distance || 0),
        duration: acc.duration + (curr.duration || 0),
      }),
      { distance: 0, duration: 0 },
    );

    // 3. Return payload formatted for both Web Recharts and Mobile LineChart
    return {
      // We slice 7 and reverse so the graph shows oldest to newest (left to right)
      recent: activities.slice(0, 7),
      summary: {
        totalDistance: totals.distance.toFixed(1), // Match mobile precision
        totalHours: (totals.duration / 3600).toFixed(1), // Convert seconds to hours
        activityCount: activities.length,
      },
    };
  }

  async createActivity(userId: string, data: any) {
    // Ensuring numeric types are correct before hitting Railway/Prisma
    return this.prisma.activity.create({
      data: {
        title: data.title || 'NEW_SESSION',
        distance: parseFloat(data.distance) || 0,
        duration: parseInt(data.duration) || 0,
        pace: data.pace?.toString() || '0:00',
        elevation: parseFloat(data.elevation) || 0,
        // If coordinates is already an object, don't parse it
        coordinates:
          typeof data.coordinates === 'string'
            ? JSON.parse(data.coordinates)
            : data.coordinates,
        userId: userId,
      },
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });
    if (!activity)
      throw new NotFoundException(`Activity with ID ${id} not found`);
    return activity;
  }
}
