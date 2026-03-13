import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // ✅ Use memory for Cloudinary
import { EventsService } from './events.service.js';
import { AuthService } from '../auth/auth.service.js'; // ✅ Needed for Cloudinary logic

@Controller(['events', 'event'])
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    // Injecting AuthService to use our cloud upload utility
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // ✅ Required for Railway/Cloudinary
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    let imageUrl = null;

    if (file) {
      // 🛰️ Upload to Cloudinary instead of local disk
      const cloudinaryResponse =
        await this.authService.uploadToCloudinary(file);
      imageUrl = cloudinaryResponse.secure_url;
    }

    return this.eventsService.createEvent({
      ...body,
      // Now storing the full HTTPS URL in the database
      image: imageUrl,
    });
  }

  @Get()
  async findAll() {
    const events = await this.eventsService.getEvents();
    return events || [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.getEventById(id);
    if (!event) throw new NotFoundException(`EVENT_WITH_ID_${id}_NOT_FOUND`);
    return event;
  }
}
