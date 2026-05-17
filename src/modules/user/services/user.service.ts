import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { UserEntity } from "src/entities/user.entity";
import { PlayerSummaryService } from "src/services/player-summary.service";
import { Repository } from "typeorm";
import { CreateProfileDTO } from "../dtos/create-profile.dto";


@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject()
    private readonly psService: PlayerSummaryService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async createProfile(dto: CreateProfileDTO) {
   
    const user = new UserEntity();

    Object.assign(user, dto)

  }
}