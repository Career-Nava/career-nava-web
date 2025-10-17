import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { UserModel } from "./user.model";

@Injectable({
  providedIn: 'root'
})
export class UserService extends RestService {

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'User', config.get<any>('api').baseUrl);
  }

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${ this.baseUrl }/GetAllUsers`);
  }

  getUserById(userId: number): Observable<UserModel> {
    const params = this.buildParams({ userId });
    return this.http.get<UserModel>(`${ this.baseUrl }/GetUserById`, { params });

    // return this.http.get<User>(`${ this.baseUrl }/GetUserById/${ userId }`); // TODO: remove after tests
  }
}
