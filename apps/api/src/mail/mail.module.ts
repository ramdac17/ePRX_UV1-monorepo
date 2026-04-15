import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global() // This makes it available to AuthModule without manual imports
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
