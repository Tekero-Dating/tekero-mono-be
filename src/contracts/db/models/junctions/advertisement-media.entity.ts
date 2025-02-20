import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Advertisement } from '../advertisements.entity';
import { Media } from '../mdeia.entity';
import { ActionsList } from '../actions-list.entity';

@Table({ modelName: 'advertisement-media' })
export class AdvertisementMedia extends Model {
  @ForeignKey(() => Advertisement)
  @Column
  advertisementId!: number;

  @ForeignKey(() => Media)
  @Column
  mediaId!: number;
}

export const AdvertisementMediaRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'ADV_MEDIA_REPOSITORY') when using  MODELS_REPOSITORIES_ENUM['ADVERTISEMENTS_MEDIA']
  provide: 'ADV_MEDIA_REPOSITORY',
  useValue: AdvertisementMedia,
};
