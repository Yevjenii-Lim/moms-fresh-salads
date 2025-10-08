import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🌐 Testing basic connectivity...');
    
    // Test 1: Basic fetch to a reliable endpoint
    let httpTest;
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET'
      });
      httpTest = response.ok ? 'success' : `failed: ${response.status}`;
      console.log('✅ Basic HTTP request successful');
    } catch (error) {
      httpTest = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Basic HTTP request failed:', error);
    }
    
    // Test 2: Try to reach Stripe's API directly
    let stripeDirectTest;
    try {
      const response = await fetch('https://api.stripe.com/v1/charges', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + 'sk_test_invalid_key_for_testing',
        }
      });
      // We expect a 401 (unauthorized) but that means we can reach Stripe
      stripeDirectTest = response.status === 401 ? 'reachable' : `unexpected: ${response.status}`;
      console.log('✅ Stripe API reachable');
    } catch (error) {
      stripeDirectTest = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Stripe API unreachable:', error);
    }
    
    // Test 3: Try DNS resolution
           let dnsTest;
           try {
             await fetch('https://api.stripe.com', {
               method: 'HEAD'
             });
             dnsTest = 'resolved';
             console.log('✅ DNS resolution successful');
           } catch (error) {
             dnsTest = error instanceof Error ? error.message : 'Unknown error';
             console.error('❌ DNS resolution failed:', error);
           }
    
    return NextResponse.json({
      status: 'connectivity-test-complete',
      timestamp: new Date().toISOString(),
      tests: {
        httpTest,
        stripeDirectTest,
        dnsTest
      }
    });
    
  } catch (error) {
    console.error('❌ Connectivity test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
