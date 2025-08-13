import amqplib from "amqplib";

export async function createChannel(url: string) {
  const conn = await amqplib.connect(url);
  const ch = await conn.createChannel();
  return { conn, ch };
}
