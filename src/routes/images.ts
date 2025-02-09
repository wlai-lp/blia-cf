import { Context } from 'hono';

type Bindings = {
  MY_BUCKET: R2Bucket
}

export async function getImage(c: Context<{ Bindings: Bindings }>) {
  const key = c.req.param('key');
  const obj = await c.env.MY_BUCKET.get(key);
  if (!obj) {
    return c.json({ error: 'Failed to get file' }, 500);
  }
  const buffer = await obj.arrayBuffer();
  console.log("Buffer size:", buffer.byteLength);
  if (!buffer) {
    return c.json({ error: 'Failed to get file buffer' }, 500);
  }

  return c.body(buffer, {
    headers: {
      'Content-Type': `application/octet-stream`,
    },
  });
}
