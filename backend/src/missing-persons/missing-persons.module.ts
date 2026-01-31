import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MissingPersonsController } from './missing-persons.controller';
import { MissingPersonsService } from './missing-persons.service';
import {
  MissingPerson,
  MissingPersonSchema,
} from './schemas/missing-person.schema';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MissingPerson.name, schema: MissingPersonSchema },
    ]),
    StorageModule,
    AuthModule,
  ],
  controllers: [MissingPersonsController],
  providers: [MissingPersonsService],
  exports: [MissingPersonsService],
})
export class MissingPersonsModule {}
