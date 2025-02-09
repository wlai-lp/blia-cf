import { Context } from 'hono';

type Bindings = {
  MY_BUCKET: R2Bucket
}

export async function getFeed(c: Context<{ Bindings: Bindings }>) {
  const res = await c.env.MY_BUCKET.list();
  if (!res) {
    return c.json({ error: 'Failed to list files' }, 500);
  }
  else {
    const keys: string[] = res.objects.map(o => {
      console.log(o.key);
      return o.key
    });
    return c.html(
      `<div>
        ${keys.map(key => `<img src="/images/${key}" />`).join('')}
      </div>`
    )
  }
}
