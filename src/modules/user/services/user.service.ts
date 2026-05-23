import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { UserEntity } from "../entities/user.entity";
import { PlayerSummaryService } from "../../player-summary/player-summary.service";
import { Repository } from "typeorm";
import { CreateProfileDTO } from "../../../common/dtos/create-profile.dto";
import * as bcrypt from 'bcrypt';
import { EditProfileDTO } from "src/common/dtos/edit-profile.dto";


@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject()
    private readonly psService: PlayerSummaryService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async createProfile(
    dto: CreateProfileDTO
  ): Promise<UserEntity> {
   
    const user = new UserEntity();

    dto.password = await bcrypt.hash(dto.password, Number(process.env.SALT_ROUNDS));

    Object.assign(user, dto)

    await this.userRepository.save(user);
    return user;
  }

  async indexUser(
    email: string
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      { 
        where: { email: email } 
      });

    if(!user) throw new NotFoundException('User not found');
    return user;
  }

  async editProfile(
    email: string,
    dto: EditProfileDTO
  ): Promise<{ message: string }> {

    const user = await this.userRepository.findOneBy({ email: email });

    if (!user) throw new NotFoundException('User not found');

    if (dto.password) dto.password = await bcrypt.hash(dto.password, Number(process.env.SALT_PASSWORD));

    await this.userRepository.update(user, dto);

    return {
      message: 'User succesfully updated'
    }
  }
}