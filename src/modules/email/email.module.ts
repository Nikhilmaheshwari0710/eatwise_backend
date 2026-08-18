import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email.service';
import { MailtrapProvider } from './providers/mailtrap.provider';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    EmailService,
    MailtrapProvider,
    {
      provide: EMAIL_PROVIDER,
      useExisting: MailtrapProvider,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
