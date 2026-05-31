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

  const res = await fetch('https://afdian.net/api/open/query-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: AFDIAN_USER_ID, params, ts, sign }),
  });

  const json = await res.json();
  if (json.ec !== 200) return [];
  return json.data?.list || [];
}

// Verify payment by matching the user's email in the order remark
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!AFDIAN_USER_ID || !AFDIAN_TOKEN) {
      return NextResponse.json({ ok: false, error: '爱发电 API 未配置' }, { status: 500 });
    }

    if (!email) {
      return NextResponse.json({ ok: false, error: '缺少邮箱' }, { status: 400 });
    }

    // Query recent orders (up to 200)
    const allOrders: any[] = [];
    for (let page = 1; page <= 4; page++) {
      const orders = await queryAfdianOrders(page);
      allOrders.push(...orders);
      if (orders.length < 50) break;
    }

    // Match by remark containing the user's email, status=2 (paid), amount >= 9.8
    const match = allOrders.find((o: any) =>
      o.status === 2 &&
      parseFloat(o.total_amount) >= 9.8 &&
      o.remark &&
      o.remark.includes(email)
    );

    if (!match) {
      return NextResponse.json({
        ok: false,
        error: `未找到匹配的赞助记录。请确认：\n1. 已支付并支付成功\n2. 备注中填写了你的注册邮箱「${email}」`,
      });
    }

    return NextResponse.json({
      ok: true,
      order: {
        out_trade_no: match.out_trade_no,
        total_amount: match.total_amount,
        plan_title: match.title || '赞助',
        created_at: match.create_time,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
