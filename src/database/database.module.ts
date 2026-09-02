import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

const logger = new Logger('DatabaseModule');

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        connectionFactory: (connection: Connection) => {
          if (connection.readyState === 1) {
            logger.log('Successfully connected to MongoDB database');
          }
          connection.on('connected', () => {
            logger.log('Successfully connected to MongoDB database');
          });
          connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
          });
          connection.on('error', (error) => {
            logger.error(`MongoDB connection error: ${error.message}`);
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
