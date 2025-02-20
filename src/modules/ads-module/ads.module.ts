import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { ClientsModule } from '@nestjs/microservices';
import {
  ADS_MODULE_QUEUES,
  ADS_SERVICE_NAME,
} from '../../contracts/ads-interface/ads.constants';
import { generateRmqOptions } from '../../utils/rmq-utils.nest';
import { AdvertisementsRepository } from '../../contracts/db/models/advertisements.entity';
import { AdvertisementMediaRepository } from '../../contracts/db/models/junctions/advertisement-media.entity';
import { MediaRepository } from '../../contracts/db/models/mdeia.entity';
import { getDbModule } from '../../utils/db-utils.nest';
import { dbOpts } from '../../config/config';

@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(ADS_MODULE_QUEUES, ADS_SERVICE_NAME),
    ),
    getDbModule([dbOpts], false),
  ],
  controllers: [AdsController],
  providers: [
    AdsService,
    MediaRepository,
    AdvertisementsRepository,
    AdvertisementMediaRepository,
  ],
})
export class AdsModule {}
