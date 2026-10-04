const defaultLandingUrl = 'https://forge-agents.space/pricing';

export function buildSocialConversionUrl(platform, topic) {
  const url = new URL(process.env.SOCIAL_LANDING_URL || defaultLandingUrl);
  url.searchParams.set('utm_source', platform);
  url.searchParams.set('utm_medium', 'organic_social');
  url.searchParams.set('utm_campaign', process.env.SOCIAL_CAMPAIGN || 'crucible_creator_content');
  url.searchParams.set('utm_content', topic);
  return url.toString();
}

export function buildSocialCallToAction(platform, topic) {
  return `Build your AI workflow with Crucible: ${buildSocialConversionUrl(platform, topic)}`;
}
