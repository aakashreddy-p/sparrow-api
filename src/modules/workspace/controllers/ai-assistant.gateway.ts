import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AiAssistantService } from "../services/ai-assistant.service";
import { StreamPromptPayload } from "../payloads/ai-assistant.payload";

/**
 * WebSocket Gateway for AI Assistant.
 * Handles WebSocket connections, disconnections, and incoming messages
 * for the AI Assistant service.
 */
@WebSocketGateway({
  namespace: "/ai-assistant",
  cors: {
    origin: "*",
  },
  transports: ["websocket"],
  methods: ["GET", "POST"],
})
export class AiAssistantGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly aiAssistantService: AiAssistantService) {}

  /**
   * Lifecycle hook that runs when the WebSocket gateway is initialized.
   *
   * @param {Server} server - The WebSocket server instance.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async afterInit(server: Server) {
    console.log("WebSocket Gateway initialized!");
  }

  /**
   * Handles new WebSocket connections.
   *
   * @param {Socket} client - The connected client socket.
   */
  async handleConnection(client: Socket) {
    console.log("Connected to web socket", client.id);
  }

  /**
   * Handles WebSocket disconnections.
   *
   * @param {Socket} client - The disconnected client socket.
   */
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handles incoming "sendPrompt" messages from clients.
   * This method triggers the AI Assistant service to generate a text stream
   * based on the provided prompt and sends the response back to the client.
   *
   * @param {Socket} client - The client socket that sent the message.
   * @param {StreamPromptPayload} promptPayload - The payload containing the prompt data.
   */
  @SubscribeMessage("sendPrompt")
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() promptPayload: StreamPromptPayload,
  ) {
    await this.aiAssistantService.generateTextStream(promptPayload, client);
  }
}

@WebSocketGateway({
  namespace: "/dummy",
  cors: {
    origin: "*",
  },
  transports: ["websocket"],
  methods: ["GET", "POST"],
})
export class DummyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async afterInit(server: Server) {
    console.log("WebSocket Gateway initialized!");
  }

  async handleConnection(client: Socket) {
    setTimeout(() => {
      client.emit("Client", "Client is connected, first event initiated.");
    }, 5000);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("")
  async handleMessage2(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: string,
  ) {
    client.emit("third", payload);
  }

  @SubscribeMessage("second")
  async handleMessage3(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: string,
  ) {
    client.emit("second", payload);
    client.emit("latest", payload);
  }

  @SubscribeMessage("first")
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: string,
  ) {
    client.emit("first", payload);
    client.emit("new", payload);
  }
}
