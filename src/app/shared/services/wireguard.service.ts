import { Injectable } from '@angular/core';
import { PGService } from './pg.service';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@env';
import { Network, Peer } from '@shared/interfaces/wireguard';

@Injectable({
  providedIn: 'root'
})
export class NetworkService extends PGService<Network> {
  constructor(http: HttpClient) {
    super(`${env.api}/networks`, http);
  }
}

@Injectable({
  providedIn: 'root'
})
export class PeerService extends PGService<Peer> {
  constructor(http: HttpClient) {
    super(`${env.api}/networks`, http); // additional required path in component `/{network}/peers`
  }
}
