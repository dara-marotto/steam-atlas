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

  getData(): Observable<any> {
    return this.data$;
  }

  findCountry(code: string): Country {
    return this.countries[code];
  }

  findState(countryCode: string, stateCode: string): State {
    return this.countries[countryCode]
      ?.states?.[stateCode];
  }

  findCity(
  countryCode: string,
  stateCode: string,
  cityId: string,
  ): City {
    return this.countries[countryCode]
      ?.states?.[stateCode]
      ?.cities?.[cityId];
  }

  getFullLocation(
    countryCode: string,
    stateCode: string,
    cityId: string
  ): { country: string; state: string; city: string } {
    return {
      country: this.findCountry(countryCode).name,
      state: this.findState(countryCode, stateCode).name,
      city: this.findCity(countryCode, stateCode, cityId).name
    }
  }
}