import { HttpClient, HttpParams } from "@angular/common/http";

export abstract class RestService {
  protected baseUrl: string;

  protected constructor(
    protected http: HttpClient,
    resource: string,
    apiBaseUrl: string
  ) {
    this.baseUrl = `${ apiBaseUrl }/${ resource }`;
  }

  // helper for services to easily build HttpParams
  protected buildParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([ key, value ]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return httpParams;
  }
}
