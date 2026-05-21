import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { PlayerSummaryService } from "src/modules/player-summary/services/player-summary.service";
import { Repository } from "typeorm";
import { CreateProfileDTO } from "../../../common/dtos/create-profile.dto";
import * as bcrypt from 'bcrypt';


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

  async findByEmail(
    email: string
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      { 
        where: { email } 
      });

    if(!user) throw new NotFoundException('User not found');
    return user;
  }
}