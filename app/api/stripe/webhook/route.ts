import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { stripe } from '../../../../lib/stripe';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event;
  try {
     event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch(e: any) {
     console.error("Webhook signature mismatch:", e.message);
     return NextResponse.json({ error: "Invalid cryptographic signature" }, { status: 400 });
  }

  // Handle Event Triggers sent directly out of Stripe's internal payment pipelines
  try {
     if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
        const dbObj = event.data.object as any;
        const customerId = dbObj.customer;
        const subscriptionId = dbObj.subscription;

        if (customerId && subscriptionId) {
            // Directly rip the subscription logic to identify what product they bought
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = sub.items.data[0].price.id;
            const amount = sub.items.data[0].price.unit_amount || 999; 
            
            // Intelligently infer the commercial tier based on the monetary value charged
            // Producer is generally under $19 and Super Producer is >= $19
            let roleAssigned = "PRODUCER";
            if (amount >= 1900) {
               roleAssigned = "SUPER_PRODUCER";
            }

            const periodEnd = new Date(sub.current_period_end * 1000);

            await prisma.user.update({
               where: { stripeCustomerId: customerId },
               data: {
                  role: roleAssigned,
                  stripeSubscriptionId: subscriptionId,
                  stripePriceId: priceId,
                  stripeCurrentPeriodEnd: periodEnd
               }
            });
        }
     }

     if (event.type === 'customer.subscription.deleted') {
        const dbObj = event.data.object as any;
        await prisma.user.update({
           where: { stripeCustomerId: dbObj.customer },
           data: {
               role: 'ARTIST',
               stripeSubscriptionId: null,
               stripePriceId: null,
               stripeCurrentPeriodEnd: null
           }
        });
     }

     return NextResponse.json({ received: true });
  } catch (err: any) {
     console.error("Webhook Processing Failure: ", err);
     return NextResponse.json({ error: "Webhook DB Failure" }, { status: 500 });
  }
}
