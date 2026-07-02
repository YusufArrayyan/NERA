import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IEEGProvider, EEG_PROVIDER } from '../eeg/interfaces/eeg-provider.interface';
import { EEGProcessingService } from '../eeg/services/eeg-processing.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/eeg',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private clientStreams: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @Inject(EEG_PROVIDER) private readonly eegProvider: any,
    private readonly processingService: EEGProcessingService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.stopClientStream(client.id);
  }

  @SubscribeMessage('startStream')
  handleStartStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pattern?: string; sessionId?: string },
  ) {
    this.stopClientStream(client.id); // Clean up any existing stream

    const pattern = data?.pattern || 'MODERATE_FOCUS';
    this.logger.log(`Starting stream for ${client.id} with pattern: ${pattern}`);

    // Stream at 10Hz (100ms intervals) for smooth real-time updates
    const intervalId = setInterval(() => {
      const raw = this.eegProvider.getDataPoint(pattern);
      if (data?.sessionId) raw.sessionId = data.sessionId;

      const processed = this.processingService.processDataPoint(raw);

      client.emit('eegData', {
        raw: {
          alpha: raw.alpha,
          beta: raw.beta,
          theta: raw.theta,
          gamma: raw.gamma,
          attention: raw.attention,
          meditation: raw.meditation,
          signalQuality: raw.signalQuality,
          timestamp: raw.timestamp,
        },
        processed: {
          focusIndex: processed.focusIndex,
          stressIndex: processed.stressIndex,
          fRatio: processed.fRatio,
          focusCategory: processed.focusCategory,
          attentionScore: processed.attentionScore,
          qualityScore: processed.qualityScore,
          recommendedMode: processed.recommendedMode,
          bandPowers: processed.bandPowers,
          timestamp: processed.timestamp,
        },
      });
    }, 100); // 10Hz — smooth for frontend charts

    this.clientStreams.set(client.id, intervalId);

    return { event: 'streamStarted', data: { pattern, frequency: '10Hz' } };
  }

  @SubscribeMessage('stopStream')
  handleStopStream(@ConnectedSocket() client: Socket) {
    this.stopClientStream(client.id);
    return { event: 'streamStopped' };
  }

  @SubscribeMessage('changePattern')
  handleChangePattern(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pattern: string },
  ) {
    // Restart stream with new pattern
    this.handleStartStream(client, data);
    return { event: 'patternChanged', data: { pattern: data.pattern } };
  }

  // Broadcast to specific room (e.g., teacher monitoring a student)
  broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    return { event: 'joinedRoom', data: { room: data.room } };
  }

  private stopClientStream(clientId: string) {
    const intervalId = this.clientStreams.get(clientId);
    if (intervalId) {
      clearInterval(intervalId);
      this.clientStreams.delete(clientId);
    }
  }
}
