import { Injectable } from '@angular/core';
import { IMqttMessage, IMqttServiceOptions, MqttConnectionState, MqttService } from 'ngx-mqtt';
import { environment as env } from '@env';
import { Observable, Subject, map } from 'rxjs';
import { AuthService } from '@edgeflare/ng-oidc'

/**
 * MQTT service options configuration
 */
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  connectOnCreate: false,
  hostname: env.mqtt.hostname,
  port: env.mqtt.port,
  path: env.mqtt.path,
  username: env.mqtt.username,
  password: env.mqtt.password,
  protocol: env.mqtt.protocol as "ws" | "wss",
};

@Injectable({
  providedIn: 'root'
})
export class MQTTService {
  client: MqttService;
  isConnected = false;

  /**
   * Constructor for MQTTService
   * @param auth AuthService for managing authentication
   */
  constructor(private auth: AuthService) {
    this.client = new MqttService(MQTT_SERVICE_OPTIONS);
    this.setupLogging();
  }

  /**
   * Sets up logging for MQTT events
   */
  private setupLogging(logMsg?: boolean) {
    this.client.onConnect.subscribe(() => {
      console.log('MQTT: Connected');
    });

    if (logMsg) {
      this.client.onMessage.subscribe((msg: IMqttMessage) => {
        console.log(`MQTT: received msg ${msg.payload.toString()} on topic ${msg.topic}`);
      });
    }

    this.client.onReconnect.subscribe(() => {
      console.log('MQTT: Reconnecting');
    });

    this.client.onError.subscribe(error => {
      console.error('MQTT Error:', error);
    });
  }

  /**
   * Connects to the MQTT broker
   * @param username Optional username for MQTT connection
   * @param password Optional password for MQTT connection
   * @returns Subject<MqttConnectionState> representing the connection state
   */
  connect(username?: string, password?: string): Subject<MqttConnectionState> {
    this.client.connect({
      ...MQTT_SERVICE_OPTIONS,
      username: username || 'public',
      password: password || 'public',
    });
    return this.client.state;
  }

  /**
   * Disconnects from the MQTT broker
   */
  disconnect() {
    this.client.disconnect();
  }

  /**
   * Subscribes to an MQTT topic
   * @param topic The topic to subscribe to
   * @returns Observable<IMqttMessage> stream of received messages
   */
  subscribe(topic: string): Observable<IMqttMessage> {
    console.log(`MQTT: Subscribing to topic ${topic}`);
    return this.client.observe(topic);
  }

  /**
   * Publishes a message to an MQTT topic
   * @param topic The topic to publish to
   * @param payload The message payload
   */
  publish(topic: string, payload: string) {
    console.log(`MQTT: Publishing to topic ${topic}, payload: ${payload}`);
    this.client.publish(topic, payload);
  }

  /**
   * Checks if the MQTT client is connected
   * @returns Observable<boolean> stream indicating connection status
   */
  isClientConnected(): Observable<boolean> {
    return this.client.state.pipe(map(state => state === MqttConnectionState.CONNECTED));
  }

  /**
   * Connects to the MQTT broker using JWT authentication
   * @returns Subject<MqttConnectionState> representing the connection state
   */
  connectWithJwt(): Subject<MqttConnectionState> {
    const username = this.auth.user()?.profile.sub || env.mqtt.username;
    const password = this.auth.user()?.access_token || env.mqtt.username;

    this.client = new MqttService({
      ...MQTT_SERVICE_OPTIONS,
      username,
      password
    });
    this.setupLogging();
    this.client.connect();

    return this.client.state;
  }

}
