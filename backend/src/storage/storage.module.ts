import { Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { IStorageService } from './storage.interface';

@Module({
  providers: [
    {
      provide: IStorageService,
      useClass: LocalStorageService,
    },
  ],
  exports: [IStorageService],
})
export class StorageModule {}
