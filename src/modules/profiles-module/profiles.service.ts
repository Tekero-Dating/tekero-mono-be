import { Inject, Injectable } from '@nestjs/common';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { UserProfile } from '../../contracts/db/models/user-profile.entity';
import { User } from '../../contracts/db/models/user.entity';
import { UpdateProfileDTO } from '../../contracts/api-interface/api.dto';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ProfilesService {
  constructor(
    @Inject(MODELS_REPOSITORIES_ENUM.USER_PROFILE)
    private userProfileRepository: typeof UserProfile,
    @Inject(MODELS_REPOSITORIES_ENUM.USER)
    private userRepository: typeof User,
  ) {}

  async getUserProfile(id: number): Promise<UserProfile | null> {
    return await this.userProfileRepository.findOne<UserProfile>({
      where: { user_id: id },
      include: User
    });
  }

  async updateUserProfile(id: number, values: UpdateProfileDTO): Promise<UserProfile & { profile_owner: User } | null> {
    const userProfileValues = {
      ...(values?.height && { height: values.height}),
      ...(values?.weight && { weight: values.weight}),
      ...(values?.constitution && { constitution: values.constitution}),
      ...(values?.bio && { bio: values.bio}),
      ...(values?.orientation && { orientation: values.orientation}),
      ...(values?.sexuality && { sexuality: values.sexuality}),
      ...(values?.playlist && { playlist: values.playlist}),
      ...(values?.homeLocation && { home_location: values.homeLocation})
    };
    const userValues: Partial<User> = {
      ...(values?.gender && { sex: values.gender}),
      ...(values?.firstName && { firstName: values.firstName}),
      ...(values?.lastName && { lastName: values.lastName}),
      ...(values?.dob && { dob: values.dob}),
      ...(values?.profilePicture && { profile_pic_id: values.profilePicture})
    };

    return await Promise.all([
      await this.userProfileRepository.update<UserProfile>(userProfileValues, {
        where: { user_id: id }
      }),
      await this.userRepository.update<User>(userValues, {
        where: { id }
      })
    ]).then(async (result) => {
      if (result[0][0]  === 0 && result[1][0] === 0) {
        return null;
      }
      const userProfile = await this.userProfileRepository.findOne<UserProfile>({
        where: { user_id: id },
        include: User
      });
      return userProfile!;
    });
  }
}
