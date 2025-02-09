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

                // Implement exponential backoff for rate limits
                let retries = 3;
                let delay = 1000;
                let lastError;

                while (retries > 0) {
                        try {
                                console.log(`Attempting to fetch data for ${username}, retries left: ${retries}`);
                                const userData = await fetchTwitterUserData(username);
                                console.log('Fetched user data:', userData);
                                return NextResponse.json(userData);
                        } catch (error: any) {
                                console.error('Error fetching user data:', error);
                                lastError = error;
                                if (error.message.includes('rate limit')) {
                                        console.log(`Rate limit hit, retrying in ${delay}ms`);
                                        await new Promise(resolve => setTimeout(resolve, delay));
                                        delay *= 2;
                                        retries--;
                                        continue;
                                }
                                throw error;
                        }
                }

                throw lastError || new Error('Max retries reached');
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
