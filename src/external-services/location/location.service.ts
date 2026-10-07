import { Injectable, OnModuleInit } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { map, Observable, shareReplay, tap } from "rxjs";
import { City, Country, Location, State } from "./location-interface";

@Injectable()
export class LocationService implements OnModuleInit {
  private countries: Location = {};
  private data$: Observable<Location>;

  constructor(private readonly httpService: HttpService) {
    this.data$ = this.httpService
    .get(
      'https://raw.githubusercontent.com/Holek/steam-friends-countries/refs/heads/master/data/steam_countries.json',
    )
    .pipe(
      map((response) => response.data),
      tap((data) => {
        this.countries = data;
      }),
      shareReplay(1),
    );
  }

  onModuleInit() {
    this.data$.subscribe();
  }

  getData(): Observable<Location> {
    return this.data$;
  }

  findCountry(code: string): Country | undefined {
    return this.countries[code];
  }

  findState(countryCode: string, stateCode: string): State | undefined {
    return this.countries[countryCode]
      ?.states?.[stateCode];
  }

  findCity(
  countryCode: string,
  stateCode: string,
  cityId: string,
  ): City | undefined {
    return this.countries[countryCode]
      ?.states?.[stateCode]
      ?.cities?.[cityId];
  }

  getFullLocation(
    countryCode: string,
    stateCode: string,
    cityId: string
  ): { country: string | null; state: string | null; city: string | null } {
    return {
      country: this.findCountry(countryCode)?.name ?? null,
      state: this.findState(countryCode, stateCode)?.name ?? null,
      city: this.findCity(countryCode, stateCode, cityId)?.name ?? null
    }
  }
}