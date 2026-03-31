import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../lib/auth';
import { stripe } from '../../../../lib/stripe';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }
    
    const { priceId } = await req.json();
    if (!priceId) {
       return NextResponse.json({ error: 'Missing price payload.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User mapping not found.' }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    // Provision a new customer inside Stripe's ecosystem if they are blank
    if (!customerId) {
       const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id }
       });
       customerId = customer.id;
       await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId }
       });
    }

    // Construct the Cryptographic Checkout Session
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const checkoutSession = await stripe.checkout.sessions.create({
       customer: customerId,
       mode: 'subscription',
       payment_method_types: ['card'],
       line_items: [
           { price: priceId, quantity: 1 }
       ],
       success_url: `${origin}/dashboard?checkout=success`,
       cancel_url: `${origin}/dashboard?checkout=canceled`,
       metadata: { userId: user.id }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch(error: any) {
    console.error("Stripe Checkout Error: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
