// /api/stripe

import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const return_url = process.env.NEXT_BASE_URL + "/";

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json("unauthorized", { status: 401 });
    }

    const _userSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));
    if (_userSubscription[0] && _userSubscription[0].stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscription[0].stripeCustomerId,
        return_url,
      });

      return NextResponse.json({ url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: return_url,
      cancel_url: return_url,
      
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user?.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ChatPDF Pro",
              description: "Unlimited PDF Sessions",
            },
            unit_amount: 2000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.log(error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
