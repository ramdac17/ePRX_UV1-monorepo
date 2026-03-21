import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(data: any) {
    // Audit log for the ePRX UV1 monorepo
    console.log('DATABASE_LOG: Storing new event...', data.title);

    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        // ✅ Date object conversion is essential for Prisma/PostgreSQL
        date: new Date(data.date),
        location: data.location,
        organizer: data.organizer,
        eventUrl: data.link,

        // Contact Information
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,

        // ✅ Ensure we don't save empty strings as image paths
        image: data.image && data.image !== '' ? data.image : null,
      },
    });
  }

  async getEvents() {
    return this.prisma.event.findMany({
      // We sort by date so the most recent upcoming events appear first
      orderBy: { date: 'desc' },
    });
  }

  async getEventById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
    });
  }
}
