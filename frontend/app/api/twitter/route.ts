/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { fetchTwitterUserData } from '@/lib/twitter';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    console.log('Received request for username:', username);

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Add rate limiting and caching logic
    const cacheKey = `twitter_data_${username}`;
    let userData;
    
    try {
      userData = await fetchTwitterUserData(username);
      console.log('Raw Twitter API response:', userData);

      // Validate the data
      if (typeof userData.Verified !== 'boolean') {
        console.warn('Invalid verified status:', userData.Verified);
        userData.Verified = Boolean(userData.Verified);
      }

      if (typeof userData['Mention Count'] !== 'number') {
        console.warn('Invalid mention count:', userData['Mention Count']);
        userData['Mention Count'] = parseInt(userData['Mention Count']) || 0;
      }

      return NextResponse.json(userData);
    } catch (error: any) {
      console.error('Twitter API fetch error:', error);
      throw error;
    }

  } catch (error: any) {
    console.error('Twitter API route error:', error);
    
    const statusCode = 
      error.message.includes('rate limit') ? 429 :
      error.message.includes('restricted') ? 403 :
      error.message.includes('not found') ? 404 :
      error.message.includes('authentication') ? 401 : 500;
    
    return NextResponse.json(
      { 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: statusCode }
    );
  }
}
