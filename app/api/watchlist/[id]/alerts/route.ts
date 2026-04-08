import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scheduleAlertEvaluation } from '@/services/alertQueue';
import axios from 'axios';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id: watchlistId } = await params;
        const body = await req.json();
        const { type, thresholdValue } = body;

        if (!type || typeof thresholdValue !== 'number') {
            return NextResponse.json({ error: 'Invalid alert configuration' }, { status: 400 });
        }

        // Verify ownership
        const watchlistItem = await prisma.watchlist.findUnique({ where: { id: watchlistId } });
        if (!watchlistItem || watchlistItem.userId !== user.id) {
            return NextResponse.json({ error: 'Watchlist item not found' }, { status: 404 });
        }

        // Create the alert in DB
        console.log(`[AlertAPI] Creating alert for user ${user.id}, watchlist ${watchlistId}...`);
        const alert = await prisma.alert.create({
            data: {
                watchlistId,
                userId: user.id,
                type,
                thresholdValue,
                status: 'ACTIVE'
            }
        });
        console.log(`[AlertAPI] Alert created: ${alert.id}`);

        // ── Write an immediate confirmation notification to the Activity Feed + Navbar bell ──
        // This ensures the user sees something right away, even before the worker fires.
        const alertTypeLabel: Record<string, string> = {
            PRICE_ABOVE: `price goes above $${thresholdValue}`,
            PRICE_BELOW: `price drops below $${thresholdValue}`,
            VOLUME_SPIKE: `volume reaches $${thresholdValue}`,
            AI_RISK_HIGH: `Sentinel risk score drops below ${thresholdValue}`,
        };
        const conditionLabel = alertTypeLabel[type] ?? `threshold of ${thresholdValue}`;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            await axios.post(
                `${baseUrl}/api/notifications/webhook`,
                {
                    userId: user.id,
                    title: '✅ Alert Scheduled',
                    message: `You'll be notified when the token ${conditionLabel}. We'll check every 60 seconds.`,
                    type: 'INFO',
                },
                { headers: { 'x-webhook-secret': process.env.WEBHOOK_SECRET } }
            );
        } catch (webhookErr: any) {
            // Non-fatal: fall back to direct DB insert so the user sees the confirmation
            console.warn(`[AlertAPI] Webhook unreachable, falling back to direct DB write: ${webhookErr.message}`);
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    title: '✅ Alert Scheduled',
                    message: `You'll be notified when the token ${conditionLabel}. We'll check every 60 seconds.`,
                    type: 'INFO',
                }
            });
        }

        // Enqueue the repeatable evaluation job
        console.log(`[AlertAPI] Scheduling repeatable evaluation for alert ${alert.id}...`);
        const job = await scheduleAlertEvaluation(alert.id);

        if (!job) {
            console.error('[AlertAPI] Failed to schedule alert evaluation (job is null)');
            // Don't delete the alert — notification was already created. Worker can be manually re-triggered.
            return NextResponse.json({ alert, job: null, warning: 'Alert created but queue scheduling failed' }, { status: 201 });
        }

        console.log(`[AlertAPI] Repeatable job scheduled: ${job.id}`);
        return NextResponse.json({ alert, job }, { status: 201 });

    } catch (error: any) {
        console.error('[AlertAPI] Create alert error:', error.message || error);
        return NextResponse.json(
            { error: `Failed to create alert: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
