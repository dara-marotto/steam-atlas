import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";
import { CreateProfileDTO } from "../../../common/dtos/create-profile.dto";
import * as bcrypt from 'bcrypt';
import { EditProfileDTO } from "src/common/dtos/edit-profile.dto";
import { PlayerSummaryService } from "src/modules/player-summary/player-summary.service";
import { PlayerEntity } from "../entities/player.entity";
import { LocationService } from "../location/location.service";


@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject()
    private readonly psService: PlayerSummaryService,
    @Inject()
    private readonly locationService: LocationService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>
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

  async indexOne(
    email: string
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      { 
        where: { email: email } 
      });

    if(!user) throw new NotFoundException('User not found');
    return user;
  }

  async index(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async editProfile(
    email: string,
    dto: EditProfileDTO
  ) {

    const user = await this.userRepository.findOneBy({ email: email });

    if (!user) throw new NotFoundException('User not found');

    if (dto.password) dto.password = await bcrypt.hash(dto.password, Number(process.env.SALT_PASSWORD));

    Object.assign(user, dto);
    const updatedUser = await this.userRepository.save(user);
  
    return {
      message: 'User successfully updated',
      user: updatedUser
    }
  }


  async linkSteamAccount(
    steamId: string, 
    email: string
  ): Promise<{ message: string, user: UserEntity}> {
    const user = await this.indexOne(email);
    user.steam_id = steamId;

    const updatedUser = await this.userRepository.save(user);

    const possiblePlayer = await this.playerRepository.findOne({
      where: { 
        steamId: steamId
       }
    });

    if(!possiblePlayer) {
      const playerData = await this.psService.getPlayerSummary(steamId);
      if(playerData) {
        const player = {
          steamId: playerData.steamId,
          playerName: playerData.playerName,
          realName: playerData.realName,
          userStatus: playerData.userStatus,
          lastLogOff: playerData.lastLogOff,
          accountAge: playerData.accountAge,
          totalPlaytime: playerData.totalPlaytime.timeInHours,
          location: `${playerData.location.country}-${playerData.location.state}-${playerData.location.city}`
        }
        await this.playerRepository.save(player);
      }
    }
    return {
      message: 'Steam account linked successfully',
      user: updatedUser
    };
  }
}