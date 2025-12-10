import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { paymentService } from '@/services/payment.service';

const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paymentIntent = searchParams.get('payment_intent');
    const appointmentId = searchParams.get('appointment_id');
    const [confirming, setConfirming] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!paymentIntent || !appointmentId) {
            navigate('/appointments');
            return;
        }

        const confirmPayment = async () => {
            try {
                await paymentService.confirmPayment({
                    payment_intent: paymentIntent,
                    appointment_id: parseInt(appointmentId),
                });
                setConfirming(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to confirm payment');
                setConfirming(false);
            }
        };

        confirmPayment();
    }, [paymentIntent, appointmentId, navigate]);

    if (confirming) {
        return (
            <AppLayout>
                <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
                    <div className="flex justify-center mb-6">
                        <Loader2 className="h-24 w-24 animate-spin text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Confirming Payment...</h1>
                    <p className="text-muted-foreground">
                        Please wait while we confirm your payment.
                    </p>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle2 className="h-24 w-24 text-yellow-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-yellow-600">Payment Processing</h1>
                    <p className="text-xl text-muted-foreground mb-4">
                        Your payment was successful, but we encountered an issue during confirmation.
                    </p>
                    <p className="text-sm text-muted-foreground mb-8">
                        {error}
                    </p>
                    <div className="space-y-4">
                        <Button
                            onClick={() => navigate('/appointments')}
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            View My Appointments
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle2 className="h-24 w-24 text-green-500" />
                </div>
                <h1 className="text-4xl font-bold mb-4 text-green-600">Payment Successful!</h1>
                <p className="text-xl text-muted-foreground mb-4">
                    Thank you for your payment. Your appointment is being confirmed.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                    You will receive a confirmation once the doctor approves your appointment.
                </p>
                <div className="space-y-4">
                    <Button
                        onClick={() => navigate(appointmentId ? `/appointments/${appointmentId}` : '/appointments')}
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        View Appointment
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                        size="lg"
                        className="w-full sm:w-auto ml-0 sm:ml-4"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
};

export default PaymentSuccessPage;
