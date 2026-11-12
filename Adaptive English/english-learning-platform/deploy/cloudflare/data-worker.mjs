import { DurableObject } from 'cloudflare:workers';
import { dataFetch, mediaGatewayFetch } from './data-gateway.mjs';
import { mediaFetch } from './media-store.mjs';
export class PrivateAudio extends DurableObject {
  fetch(request) { return mediaFetch(request,this.ctx.storage); }
}
export default {
  async fetch(request,env) {
    if(new URL(request.url).pathname==='/v1/media') return mediaGatewayFetch(request,env);
    return dataFetch(request,env);
  }
};
