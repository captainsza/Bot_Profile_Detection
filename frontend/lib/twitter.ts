/* eslint-disable @typescript-eslint/no-explicit-any */
import { TwitterApi } from 'twitter-api-v2';

// Initialize the Twitter client with better error handling
function createTwitterClient() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error('TWITTER_BEARER_TOKEN is not configured');
  }
  // Use bearer token authentication for read-only access
  return new TwitterApi(bearerToken);
}

export interface TwitterUserData {
  Tweet: string;
  'Retweet Count': number;
  'Mention Count': number;
  'Follower Count': number;
  Verified: boolean;
  Hashtags: string;
}

export async function fetchTwitterUserData(username: string): Promise<TwitterUserData> {
  try {
    const client = createTwitterClient();
    username = username.replace('@', '').trim();

    if (!username) {
      throw new Error('Username is required');
    }

    // Use more basic endpoints available with Essential access
    const user = await client.v2.userByUsername(username, {
      'user.fields': ['public_metrics', 'verified']
    });

    if (!user.data) {
      throw new Error(`User ${username} not found`);
    }

    // Get tweets with mentions field
    const tweets = await client.v2.userTimeline(user.data.id, {
      max_results: 5,
      'tweet.fields': ['public_metrics', 'entities'],
      'user.fields': ['public_metrics', 'verified'],
      exclude: ['retweets', 'replies']
    });

    // Get the latest tweet
    const tweet = tweets.data.data?.[0];
    
    // Handle case where user has no tweets
    if (!tweet) {
      return {
        Tweet: "",
        'Retweet Count': 0,
        'Mention Count': 0,
        'Follower Count': user.data.public_metrics?.followers_count || 0,
        Verified: user.data.verified || false,
        Hashtags: ""
      };
    }

    // Get mentions from entities if available, otherwise count @ symbols
    const mentionCount = tweet.entities?.mentions?.length || 
                        (tweet.text.match(/@\w+/g) || []).length;

    // Get hashtags from entities if available
    const hashtags = tweet.entities?.hashtags?.map(h => `#${h.tag}`).join(', ') || 
                    (tweet.text.match(/#\w+/g) || []).join(', ');

    return {
      Tweet: tweet.text,
      'Retweet Count': tweet.public_metrics?.retweet_count || 0,
      'Mention Count': mentionCount,
      'Follower Count': user.data.public_metrics?.followers_count || 0,
      Verified: user.data.verified || false,
      Hashtags: hashtags
    };

  } catch (error: any) {
    console.error('Twitter API Error:', {
      message: error.message,
      code: error.code,
      data: error.data
    });

    // Enhanced error handling
    if (error.code === 429) {
      throw new Error('Twitter API rate limit reached. Please try again in a few minutes.');
    } else if (error.code === 403) {
      throw new Error('Access to this Twitter data is restricted. Please try again later.');
    } else if (error.code === 401) {
      throw new Error('Twitter API authentication failed. Please check credentials.');
    } else if (error.code === 404) {
      throw new Error(`Twitter user "${username}" not found.`);
    } else {
      throw new Error(`Failed to fetch Twitter data: ${error.message}`);
    }
  }
}
