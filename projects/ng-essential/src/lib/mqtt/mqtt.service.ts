// import { Injectable, Inject } from '@angular/core';
// import { IMqttMessage, IMqttServiceOptions, MqttConnectionState, MqttService } from 'ngx-mqtt';
// import { Observable, Subject, map } from 'rxjs';
// import { AuthService } from 'ng-oidc';
// import { InjectionToken } from '@angular/core';

// export interface MqttConfig extends IMqttServiceOptions {}

// export const MQTT_CONFIG_TOKEN = new InjectionToken<MqttConfig>('MQTT_CONFIG');

// @Injectable({
//   providedIn: 'root'
// })
// export class MQTTService {
//   client: MqttService;
//   isConnected: boolean = false;

//   constructor(
//     @Inject(MQTT_CONFIG_TOKEN) private mqttConfig: MqttConfig,
//     private auth: AuthService
//   ) {
//     this.client = new MqttService(mqttConfig);
//     this.setupLogging();
//   }

//   private setupLogging() {
//     this.client.onConnect.subscribe(() => {
//       console.log('MQTT: Connected');
//     });

//     this.client.onMessage.subscribe((message: IMqttMessage) => {
//       console.log('MQTT: Message received', message.payload.toString());
//     });

//     this.client.onReconnect.subscribe(() => {
//       console.log('MQTT: Reconnecting');
//     });

//     this.client.onError.subscribe(error => {
//       console.error('MQTT Error:', error);
//     });
//   }

//   connect(username?: string, password?: string): Subject<MqttConnectionState> {
//     this.client.connect({
//       ...this.mqttConfig,
//       username: username || 'public',
//       password: password || 'public',
//     });
//     return this.client.state;
//   }

//   disconnect() {
//     this.client.disconnect();
//   }

//   subscribe(topic: string): Observable<IMqttMessage> {
//     console.log(`MQTT: Subscribing to topic ${topic}`);
//     return this.client.observe(topic);
//   }

//   publish(topic: string, payload: string) {
//     console.log(`MQTT: Publishing to topic ${topic}, payload: ${payload}`);
//     this.client.publish(topic, payload);
//   }

//   isClientConnected(): Observable<boolean> {
//     return this.client.state.pipe(map(state => state === MqttConnectionState.CONNECTED));
//   }

//   connectWithJwt(): Subject<MqttConnectionState> {
//     const username = this.auth.user()?.profile.sub || this.mqttConfig.username;
//     const password = this.auth.user()?.access_token || this.mqttConfig.password;

//     this.client = new MqttService({
//       ...this.mqttConfig,
//       username,
//       password
//     });
//     this.setupLogging();
//     this.client.connect();

//     return this.client.state;
//   }
// }
