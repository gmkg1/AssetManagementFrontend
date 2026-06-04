import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface IssueAssetPayload {
  assetId: string;
  assetName: string;
  assetTag: string;
  assetModel: string;
  assetCategory: string;
  model: string;
  status: string;
  issueTo: string;
  selectedUser: string;
  issueDate: string;
  expectedReturn: string;
  expectedReturnTime: string;
  notes: string;
}

export interface IssueAssetResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  issueAsset(payload: IssueAssetPayload): Observable<IssueAssetResponse> {
    // TODO: revert to real endpoint when backend is reachable
    // return this.http.post<IssueAssetResponse>(`${this.apiUrl}/assets/issue`, payload);
    return this.http.post<IssueAssetResponse>('https://httpbin.org/post', payload);
  }
}
