import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const AFDIAN_USER_ID = process.env.AFDIAN_USER_ID || '';
const AFDIAN_TOKEN = process.env.AFDIAN_TOKEN || '';

function afdianSign(params: string, ts: number): string {
  const raw = `${AFDIAN_TOKEN}params${params}ts${ts}user_id${AFDIAN_USER_ID}`;
  return crypto.createHash('md5').update(raw).digest('hex');
}

async function queryAfdianOrders(page = 1): Promise<any[]> {
  const params = JSON.stringify({ page });
  const ts = Math.floor(Date.now() / 1000);
  const sign = afdianSign(params, ts);

  const body = JSON.stringify({
    user_id: AFDIAN_USER_ID,
    params,
    ts,
    sign,
  });

  const res = await fetch('https://afdian.net/api/open/query-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const json = await res.json();
  if (json.ec !== 200) return [];
  return json.data?.list || [];
}

export async function POST(req: NextRequest) {
  try {
    const { afdianUserId, neuroconnectUserId } = await req.json();

    if (!AFDIAN_USER_ID || !AFDIAN_TOKEN) {
      return NextResponse.json({ ok: false, error: '爱发电 API 未配置' }, { status: 500 });
    }

    if (!afdianUserId || !neuroconnectUserId) {
      return NextResponse.json({ ok: false, error: '缺少参数' }, { status: 400 });
    }

    // Query recent orders (first 3 pages = up to 150 orders)
    const allOrders: any[] = [];
    for (let page = 1; page <= 3; page++) {
      const orders = await queryAfdianOrders(page);
      allOrders.push(...orders);
      if (orders.length < 50) break;
    }

    // Find a matching order: 爱发电 user_id matches, status=2 (paid), amount >= 9.9
    const match = allOrders.find((o: any) =>
      o.user_id === afdianUserId &&
      o.status === 2 &&
      parseFloat(o.total_amount) >= 9.8
    );

    if (!match) {
      return NextResponse.json({ ok: false, error: '未找到匹配的赞助记录，请确认已支付并在爱发电备注中填写你的用户名' });
    }

    return NextResponse.json({
      ok: true,
      order: {
        out_trade_no: match.out_trade_no,
        total_amount: match.total_amount,
        plan_title: match.title || '自定义金额',
        created_at: match.create_time,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
