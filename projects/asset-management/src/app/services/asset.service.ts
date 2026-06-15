import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

const env = environment as { apiUrl?: string; baseUrl?: string };

@Injectable({
  providedIn: 'root'
})
export class AssetService {

  private baseUrl = env.apiUrl ?? env.baseUrl;

  constructor(private http: HttpClient) {}

  /** GET /status — asset counts by status for the dashboard donut */
  getStatusSummary() {
    return this.http.get<any>(`${this.baseUrl}/status`);
  }

  getAssets(filters: {
    page?: number;
    pageSize?: number;
    assetName?: string;
    assetTagName?: string;
    categoryId?: string;
    locationId?: string;
    statusId?: string;
    purchaseDateFrom?: string;
    purchaseDateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    let params = new HttpParams()
      .set('page', (filters.page ?? 1).toString())
      .set('pageSize', (filters.pageSize ?? 10).toString());
    if (filters.assetName) params = params.set('assetName', filters.assetName);
    if (filters.assetTagName) params = params.set('assetTagName', filters.assetTagName);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.locationId) params = params.set('locationId', filters.locationId);
    if (filters.statusId) params = params.set('statusId', filters.statusId);
    if (filters.purchaseDateFrom) params = params.set('purchaseDateFrom', filters.purchaseDateFrom);
    if (filters.purchaseDateTo) params = params.set('purchaseDateTo', filters.purchaseDateTo);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    // Also try adding 'sort' commonly used by some backends
    params = params.set('sort', '-createdAt,-_id');
    return this.http.get<any>(`${this.baseUrl}/assets`, { params });
  }

  /** GET /assets-search?q=query */
  searchAssets(query: string) {
    const params = new HttpParams().set('q', query);
    return this.http.get<any>(`${this.baseUrl}/assets-search`, { params });
  }

  getCategories() {
    return this.http.get<any>(`${this.baseUrl}/categories`);
  }

  getLocations() {
    return this.http.get<any>(`${this.baseUrl}/locations-list`);
  }

  getStatuses() {
    return this.http.get<any>(`${this.baseUrl}/statuses-list`);
  }

  /** legacy helper */
  getAssetsLegacy(page: number = 1, size: number = 10) {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.baseUrl}/assets`, { params });
  }

  /** GET /grp?categoryId=X&page=Y&pageSize=Z */
  getAssetsByCategory(categoryId: string, page: number = 1, pageSize: number = 10) {
    const params = new HttpParams()
      .set('categoryId', categoryId)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<any>(`${this.baseUrl}/grp`, { params });
  }

  /** GET /categories?page=X&size=Y */
  getCategoryCount(page: number = 1, size: number = 10) {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.baseUrl}/categories`, { params });
  }

  /** GET /issued-assets?page=X&pageSize=Y */
  getIssuedAssets(filters: {
    page?: number;
    pageSize?: number;
    assetName?: string;
    category?: string;
    issuedTo?: string;
    type?: string;
    issueDate?: string;
  } = {}) {
    let params = new HttpParams()
      .set('page', (filters.page ?? 1).toString())
      .set('pageSize', (filters.pageSize ?? 10).toString());
    if (filters.assetName) params = params.set('assetName', filters.assetName);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.issuedTo) params = params.set('issuedTo', filters.issuedTo);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.issueDate) params = params.set('issueDate', filters.issueDate);
    return this.http.get<any>(`${this.baseUrl}/issued-assets`, { params });
  }

  /** POST /issue-asset */
  createIssueAsset(payload: {
    assetId: string;
    issueDate?: string;
    locationId?: string | null;
    personId?: string | null;
    issuedToAssetId?: string | null;
  }) {
    return this.http.post<any>(`${this.baseUrl}/issue-asset`, payload);
  }

  /** POST /return-asset */
  returnAsset(payload: {
    assetId: string;
    issuetoId: string;
    returnDate: string;
    notes?: string;
  }) {
    return this.http.post<any>(`${this.baseUrl}/return-asset`, payload);
  }

  /** GET /return-logs?page=X&pageSize=Y */
  getReturnLogs(
    pageOrFilters: number | {
      page?: number;
      pageSize?: number;
      name?: string;
      classification?: string;
      total?: string;
      returnType?: string;
      returnTo?: string;
      returnDate?: string;
    } = 1,
    size: number = 10
  ) {
    const filters = typeof pageOrFilters === 'number'
      ? { page: pageOrFilters, pageSize: size }
      : pageOrFilters;

    let params = new HttpParams()
      .set('page', (filters.page ?? 1).toString())
      .set('pageSize', (filters.pageSize ?? 10).toString());
    if (filters.name) params = params.set('name', filters.name);
    if (filters.classification) params = params.set('classification', filters.classification);
    if (filters.total) params = params.set('total', filters.total);
    if (filters.returnType) params = params.set('returnType', filters.returnType);
    if (filters.returnTo) params = params.set('returnTo', filters.returnTo);
    if (filters.returnDate) params = params.set('returnDate', filters.returnDate);
    return this.http.get<any>(`${this.baseUrl}/return-logs`, { params });
  }

  /** GET /asset-status-summary?page=X&size=Y */
  getAssetStatusSummary(page: number = 1, size: number = 10) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('pageSize', size.toString());
    return this.http.get<any>(`${this.baseUrl}/asset-status-summary`, { params });
  }

  getAssetTags() {
    return this.http.get<any>(`${this.baseUrl}/asset-tags-list`);
  }

  createAsset(payload: any) {
    return this.http.post<any>(`${this.baseUrl}/create-asset`, payload);
  }

  createAssetTag(payload: any) {
    return this.http.post<any>(`${this.baseUrl}/create-asset-tag`, payload);
  }

  getAssetDetails(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.get<any>(`${this.baseUrl}/asset-details`, { params });
  }

  updateAsset(payload: any) {
    return this.http.put<any>(`${this.baseUrl}/edit-asset`, payload);
  }
}
