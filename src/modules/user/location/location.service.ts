import { Injectable, OnModuleInit } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { map, Observable, shareReplay, tap } from "rxjs";

@Injectable()
export class LocationService implements OnModuleInit {
  private countries: Record<string, any> = {};
  private data$: Observable<any>;

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

  findCountry(code: string) {
    return this.countries[code];
  }

  findState(countryCode: string, stateCode: string) {
    return this.countries[countryCode]
      ?.states?.[stateCode];
  }

  findCity(
  countryCode: string,
  stateCode: string,
  cityId: string,
  ) {
    return this.countries[countryCode]
      ?.states?.[stateCode]
      ?.cities?.[cityId];
  }

  getFullLocation(
    countryCode: string,
    stateCode: string,
    cityId: string
  ) {
    return {
      country: this.findCountry(countryCode).name,
      state: this.findState(countryCode, stateCode).name,
      city: this.findCity(countryCode, stateCode, cityId).name
    }
  }
}