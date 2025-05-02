
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const message = await env.neonKV.get("last_message") || "No message found.";
    return new Response(`PlexiBot Response: ${message}`);
  }
}

export class SessionStore {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    return new Response("Durable Object Active");
  }
}
