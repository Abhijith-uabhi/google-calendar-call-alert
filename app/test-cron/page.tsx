// app/test-cron/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestCronPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testCron = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/cron/cron-events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET }`,
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Cron Job</CardTitle>
          <CardDescription>
            Manually trigger the calendar check and call reminder cron job
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testCron} disabled={loading} className="w-full">
            {loading ? 'Running...' : 'Run Cron Job Now'}
          </Button>

          {result && (
            <Alert>
              <AlertDescription>
                <pre className="text-xs overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}