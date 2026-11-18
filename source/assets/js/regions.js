// Help by region. Numbers and hours checked against each service's own site or a
// government listing on 17 November 2026. The app guesses the region from the
// device's time zone; the person can change it on the Help page or in settings.
import * as store from './store.js';

export const REGIONS = {
  au: { n: 'Australia', em: '000', emText: '000 (triple zero)',
    crisis: 'Lifeline on 13 11 14, any time',
    care: 'Your GP can assess you, prepare a mental health treatment plan and refer you to a psychologist. Through Medicare\'s Better Access initiative this gives you a rebate for up to 10 individual sessions each calendar year (checked November 2026; ask your GP about current rules).',
    careSrc: 'https://www.health.gov.au/our-work/better-access-initiative',
    groups: [
      { t: 'If you are struggling or feel unsafe', crisis: true, items: [
        { o: 'Lifeline', who: 'Crisis support', d: 'Crisis support and suicide prevention. You can also text 0477 13 11 14 or chat online.', ph: '13 11 14', h: '24 hours', u: 'https://www.lifeline.org.au' },
        { o: '13YARN', who: 'Aboriginal and Torres Strait Islander people', d: 'Crisis support run by and for Aboriginal and Torres Strait Islander people.', ph: '13 92 76', h: '24 hours', u: 'https://www.13yarn.org.au' },
        { o: 'Suicide Call Back Service', who: 'Thoughts of suicide', d: 'Free professional counselling by phone, video and online chat for anyone affected by suicide.', ph: '1300 659 467', h: '24 hours', u: 'https://www.suicidecallbackservice.org.au' }] },
      { t: 'Trauma, abuse and violence', items: [
        { o: '1800RESPECT', who: 'Sexual assault, domestic and family violence', d: 'Counselling, information and help with safety planning. You can also text 0458 737 732 or chat online.', ph: '1800 737 732', h: '24 hours', u: 'https://www.1800respect.org.au' },
        { o: 'Blue Knot Helpline', who: 'Adults who experienced childhood trauma', d: 'Trauma-specialist phone counselling, information and referrals for adult survivors of childhood trauma and abuse, and their supporters. Press 1 for the helpline.', ph: '1300 657 380', h: '9am to 5pm, every day (eastern Australian time)', u: 'https://blueknot.org.au' },
        { o: 'Open Arms', who: 'Current and former ADF members and their families', d: 'Free, confidential counselling from a service founded by Vietnam veterans.', ph: '1800 011 046', h: '24 hours', u: 'https://www.openarms.gov.au' }] },
      { t: 'Finding care', items: [
        { o: 'Medicare Mental Health', who: 'Finding the right service', d: 'Free advice and connection to mental health services near you, including walk-in Medicare Mental Health Centres. Not a crisis service.', ph: '1800 595 212', h: '8.30am to 5pm, weekdays', u: 'https://www.medicarementalhealth.gov.au' },
        { o: 'Beyond Blue', who: 'Anxiety and depression', d: 'Free short-term counselling, advice and referral, by phone or webchat.', ph: '1300 22 4636', h: '24 hours', u: 'https://www.beyondblue.org.au' },
        { o: 'Phoenix Australia', who: 'Information about PTSD', d: 'Australia\'s national centre for post-traumatic mental health. Plain-language guides, including how to find a trauma-trained practitioner.', u: 'https://www.phoenixaustralia.org' }] },
      { t: 'Other support', items: [
        { o: 'MensLine Australia', who: 'Men', d: 'Professional phone and online counselling for men.', ph: '1300 78 99 78', h: '24 hours', u: 'https://mensline.org.au' },
        { o: 'QLife', who: 'LGBTIQ+ people', d: 'Peer support and referral, by phone or webchat. Afternoons and evenings; check the website for current hours.', ph: '1800 184 527', u: 'https://qlife.org.au' },
        { o: 'Kids Helpline', who: 'Young people aged 5 to 25', d: 'Free, private counselling by phone or webchat.', ph: '1800 55 1800', h: '24 hours', u: 'https://kidshelpline.com.au' }] }] },
  nz: { n: 'New Zealand', em: '111', emText: '111',
    crisis: 'call or text 1737, any time',
    care: 'Your GP can assess you and refer you to talking therapy. If the trauma was sexual abuse or assault, ACC can fund therapy; Safe to talk can explain how.',
    groups: [
      { t: 'If you are struggling or feel unsafe', crisis: true, items: [
        { o: '1737', who: 'Crisis support', d: 'Free call or text to talk with a trained counsellor or peer support worker.', ph: '1737', h: '24 hours', u: 'https://1737.org.nz' },
        { o: 'Lifeline Aotearoa', who: 'Crisis support', d: 'Crisis support. You can also text HELP (4357).', ph: '0800 543 354', h: '7am to midnight, every day', u: 'https://www.lifeline.org.nz' }] },
      { t: 'Trauma, abuse and violence', items: [
        { o: 'Safe to talk', who: 'Anyone affected by sexual harm', d: 'Free, confidential support from trained specialists, recent or historic harm. You can also text 4334 or use webchat.', ph: '0800 044 334', h: '24 hours', u: 'https://www.safetotalk.nz' }] }] },
  uk: { n: 'United Kingdom', em: '999', emText: '999 (or 112)',
    crisis: 'Samaritans free on 116 123, any time',
    care: 'Your GP can refer you for trauma-focused therapy. In England you can also refer yourself to NHS Talking Therapies.',
    groups: [
      { t: 'If you are struggling or feel unsafe', crisis: true, items: [
        { o: 'Samaritans', who: 'Crisis support', d: 'Free, confidential emotional support.', ph: '116 123', h: '24 hours', u: 'https://www.samaritans.org' }] },
      { t: 'Trauma, abuse and violence', items: [
        { o: '24/7 Rape & Sexual Abuse Support Line', who: 'Anyone aged 16 or over in England and Wales', d: 'Run by Rape Crisis England & Wales. Phone or online chat.', ph: '0808 500 2222', h: '24 hours', u: 'https://247sexualabusesupport.org.uk' },
        { o: 'Combat Stress', who: 'Veterans', d: 'A helpline for former service men and women with PTSD and other mental health problems, and their families.', ph: '0800 138 1619', h: '24 hours', u: 'https://combatstress.org.uk' }] }] },
  ie: { n: 'Ireland', em: '112', emText: '112 or 999',
    crisis: 'Samaritans free on 116 123, any time',
    care: 'Your GP can assess you and refer you to mental health services.',
    groups: [
      { t: 'If you are struggling or feel unsafe', crisis: true, items: [
        { o: 'Samaritans', who: 'Crisis support', d: 'Free, confidential emotional support.', ph: '116 123', h: '24 hours', u: 'https://www.samaritans.org/ireland' }] }] },
  us: { n: 'United States', em: '911', emText: '911',
    crisis: 'call or text 988, any time',
    care: 'Your doctor can refer you to a therapist trained in a trauma-focused therapy.',
    groups: [
      { t: 'If you are struggling or feel unsafe', crisis: true, items: [
        { o: '988 Suicide & Crisis Lifeline', who: 'Crisis support', d: 'Call or text for free, confidential support.', ph: '988', h: '24 hours', u: 'https://988lifeline.org' },
        { o: 'Veterans Crisis Line', who: 'Veterans, service members and their families', d: 'Dial 988, then press 1. You can also text 838255.', ph: '988', h: '24 hours', u: 'https://www.veteranscrisisline.net' }] },
      { t: 'Trauma, abuse and violence', items: [
        { o: 'RAINN National Sexual Assault Hotline', who: 'Anyone affected by sexual violence', d: 'Free, confidential support.', ph: '800 656 4673', h: '24 hours', u: 'https://rainn.org' }] }] },
  ca: { n: 'Canada', em: '911', emText: '911',
    crisis: 'call or text 9-8-8, any time',
    care: 'Your family doctor can refer you to a therapist trained in a trauma-focused therapy.',
    groups: [
      { t: 'If you are struggling or feel unsafe', crisis: true, items: [
        { o: '9-8-8 Suicide Crisis Helpline', who: 'Crisis support', d: 'Call or text for free support.', ph: '988', h: '24 hours', u: 'https://988.ca' }] }] },
  other: { n: 'Elsewhere', em: '', emText: 'your local emergency number (in the European Union, 112)',
    crisis: 'find a free crisis line in your country at findahelpline.com',
    care: 'A family doctor or local mental health service is usually the first step to trauma-focused therapy.',
    groups: [
      { t: 'If you are struggling or feel unsafe', crisis: true, items: [
        { o: 'Find A Helpline', who: 'Crisis lines worldwide', d: 'A directory of free, confidential helplines in many countries.', u: 'https://findahelpline.com' }] }] }
};
export const RORDER = ['au', 'nz', 'uk', 'ie', 'us', 'ca', 'other'];

export function guessRegion() {
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* ignore */ }
  if (!tz) return 'au';
  if (/^Australia\//.test(tz) || tz === 'Antarctica/Macquarie') return 'au';
  if (tz === 'Pacific/Auckland' || tz === 'Pacific/Chatham') return 'nz';
  if (tz === 'Europe/London' || tz === 'Europe/Belfast') return 'uk';
  if (tz === 'Europe/Dublin') return 'ie';
  if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Whitehorse|Yellowknife|Iqaluit|Glace_Bay|Goose_Bay|Dawson|Dawson_Creek|Fort_Nelson|Creston|Swift_Current|Rankin_Inlet|Resolute|Cambridge_Bay|Inuvik|Atikokan|Blanc-Sablon|Montreal)$/.test(tz)) return 'ca';
  if (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Juneau|Sitka|Yakutat|Nome|Metlakatla|Adak|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)$/.test(tz) || tz === 'Pacific/Honolulu') return 'us';
  return 'other';
}

export function currentRegion() {
  const r = store.ui().region;
  return REGIONS[r] ? r : guessRegion();
}
export function regionData() { return REGIONS[currentRegion()]; }
