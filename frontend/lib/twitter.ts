/* eslint-disable @typescript-eslint/no-explicit-any */
import { TwitterApi } from 'twitter-api-v2';

function createTwitterClient(useBackupToken = false) {
  const primaryToken = process.env.TWITTER_BEARER_TOKEN;
  const backupToken = process.env.TWITTER_BEARER_TOKEN2;
  
  const token = useBackupToken ? backupToken : primaryToken;
  
  if (!token) {
    throw new Error(useBackupToken ? 
      'Backup TWITTER_BEARER_TOKEN2 is not configured' : 
      'Primary TWITTER_BEARER_TOKEN is not configured'
    );
  }
  return new TwitterApi(token);
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
  let attempt = 1;
  const maxAttempts = 2; // We have 2 tokens

  while (attempt <= maxAttempts) {
    try {
      const useBackupToken = attempt === 2;
      const client = createTwitterClient(useBackupToken);
      
      console.log(`Attempting to fetch data using ${useBackupToken ? 'backup' : 'primary'} token...`);
      
      username = username.replace('@', '').trim();

      if (!username) {
        throw new Error('Username is required');
      }

      // Enhanced user fields request
      const user = await client.v2.userByUsername(username, {
        'user.fields': [
          'public_metrics',
          'verified',
          'verified_type',
          'protected',
          'description'
        ]
      });

      if (!user.data) {
        throw new Error(`User ${username} not found`);
      }

      // Get tweets with enhanced fields
      const tweets = await client.v2.userTimeline(user.data.id, {
        max_results: 5,
        'tweet.fields': [
          'public_metrics',
          'entities',
          'context_annotations',
          'conversation_id',
          'referenced_tweets'
        ],
        'user.fields': ['verified'],
        expansions: ['referenced_tweets.id', 'in_reply_to_user_id'],
        exclude: ['retweets', 'replies']
      });

      const tweet = tweets.data.data?.[0];
      
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

      // Enhanced mention count calculation
      const mentionCount = tweet.entities?.mentions?.length || 
                          (tweet.text.match(/@\w+/g) || []).length;

      // Enhanced hashtag extraction
      const hashtags = tweet.entities?.hashtags ?
        tweet.entities.hashtags.map(h => `#${h.tag}`).join(', ') :
        (tweet.text.match(/#\w+/g) || []).join(', ');

      // Legacy verification check for API v2
      const isVerified = Boolean(
        user.data.verified || 
        user.data.verified_type || 
        (user as any).verified_type // For different API versions
      );

      return {
        Tweet: tweet.text,
        'Retweet Count': tweet.public_metrics?.retweet_count || 0,
        'Mention Count': mentionCount,
        'Follower Count': user.data.public_metrics?.followers_count || 0,
        Verified: isVerified,
        Hashtags: hashtags
      };

    } catch (error: any) {
      console.error(`Twitter API Error (Attempt ${attempt}):`, {
        message: error.message,
        code: error.code,
        data: error.data
      });

      if (error.code === 429 && attempt < maxAttempts) {
        console.log('Rate limit hit, trying backup token...');
        attempt++;
        continue;
      }

      // Enhance error messages to include which token failed
      const tokenType = attempt === 1 ? 'primary' : 'backup';
      if (error.code === 429) {
        throw new Error(`Rate limit reached for both tokens. Please try again later.`);
      } else if (error.code === 403) {
        throw new Error(`Access restricted (${tokenType} token). Please check permissions.`);
      } else if (error.code === 401) {
        throw new Error(`Authentication failed (${tokenType} token). Please check credentials.`);
      } else if (error.code === 404) {
        throw new Error(`Twitter user "${username}" not found.`);
      } else {
        throw new Error(`Failed to fetch Twitter data: ${error.message}`);
      }
    }
  }

  throw new Error('All Twitter API tokens have been exhausted.');
}
