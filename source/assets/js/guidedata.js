// The "Understand it" pages. Plain English; every technical word explained the first
// time it appears. Blocks: p (paragraph with grade g and source keys r), fig (a
// diagram from diagrams.js), cards, tx (a treatment table), note.

export const GUIDE = [
{
  id: 'what', scene: 'fragments', tone: 'navy',
  title: 'What PTSD is', eyebrow: 'Understand it',
  lede: 'A set of reactions that can follow a terrifying event, and that keep the danger feeling present long after it has passed.',
  sections: [
    { h: 'What counts as trauma', blocks: [
      { p: 'In the diagnostic manuals, a traumatic event means being exposed to death or threatened death, serious injury, or sexual violence: by living through it, seeing it happen to someone else, learning that it happened to someone close, or, in some jobs, repeated exposure to its details. Many other painful experiences hurt deeply without fitting this definition; that does not make them less real.', g: '', r: 'DSM5' },
      { p: 'Trauma is common. In surveys of 68,894 adults in 24 countries, more than 70% had lived through at least one traumatic event, and almost a third had lived through four or more.', g: 'strong', r: 'WMH_TRAUMA' } ] },
    { h: 'The four groups of reactions', blocks: [
      { cards: [
        { scene: 'fragments', t: 'Coming back', d: 'Unwanted memories, nightmares, flashbacks (moments of feeling or acting as if it is happening again), and strong body reactions to reminders.' },
        { scene: 'avoid_door', t: 'Avoiding', d: 'Keeping away from reminders, or from thoughts and feelings about what happened.' },
        { scene: 'core_beliefs', t: 'Changes in thoughts and mood', d: 'Harsh beliefs about yourself, others or the world; blame, fear, shame, guilt or anger; losing interest; feeling cut off or numb.' },
        { scene: 'vigilance', t: 'On guard', d: 'Being watchful and jumpy, irritable or reckless, finding it hard to concentrate or sleep.' } ] },
      { p: 'PTSD is diagnosed when these reactions last more than a month and cause real distress or get in the way of daily life. Only a qualified professional can diagnose it. The symptom check in this app can show how strong your reactions are, but it is not a diagnosis.', g: '', r: 'DSM5 NCPTSD' } ] },
    { h: 'How common it is', blocks: [
      { p: 'In Australia\'s national survey of 15,893 people aged 16 to 85, 5.6% had PTSD in the previous 12 months: 7.4% of women and 3.7% of men. Across 24 countries, 3.9% of adults had PTSD at some point in their lives.', g: 'strong', r: 'ABS WMH_PTSD' },
      { p: 'The type of trauma matters. Trauma involving another person\'s violence, such as rape, sexual assault or being stalked, carried the highest risk of PTSD, and the sudden unexpected death of a loved one accounted for a large share of PTSD in the population because it is so common.', g: 'strong', r: 'WMH_TYPES' } ] },
    { h: 'Why some people develop it and others do not', blocks: [
      { p: 'Most people who live through a traumatic event do not develop lasting PTSD. Across 54 studies that followed people over time, about two in three had few or no lasting symptoms, about one in five improved after a difficult period, and about one in ten had lasting symptoms.', g: 'mod', r: 'RESILIENCE' },
      { p: 'Developing PTSD is not a sign of weakness. What happens during and after the event matters more than anything about the person beforehand: how severe and threatening it was, feeling detached or unreal during it, a lack of support afterwards, and further stress that followed.', g: 'strong', r: 'RISK PREDICT' } ] },
    { h: 'Freezing is a reflex, not a choice', blocks: [
      { p: 'Many people blame themselves for not fighting or running. But the body has an automatic freeze response, sometimes with complete paralysis called tonic immobility. In a study of 298 women seen soon after a sexual assault, 70% had experienced significant paralysis during the assault.', g: 'mod', r: 'TONIC' } ] },
    { h: 'Complex PTSD', blocks: [
      { fig: 'cptsd' },
      { p: 'The World Health Organization\'s diagnostic system (ICD-11) also describes complex PTSD. It includes the core parts of PTSD plus lasting difficulties with emotions, self-worth and relationships, and is more common after prolonged or repeated trauma that was hard to escape. In a US national survey, 3.4% of adults met the criteria for PTSD and 3.8% for complex PTSD.', g: 'mod', r: 'ICD11 CPTSD_US' } ] },
    { h: 'It can get better', blocks: [
      { p: 'Across 42 studies of people with PTSD who had no specific treatment, about 44% no longer had it after about three years. Recovery was more likely in people assessed in the first months after the trauma. Trauma-focused therapy helps most people recover sooner, including people who have had PTSD for many years.', g: 'mod', r: 'REMISSION LEWIS2020' } ] }
  ]
},
{
  id: 'cycle', scene: 'alarm', tone: 'rose',
  title: 'Why PTSD keeps going', eyebrow: 'Understand it',
  lede: 'PTSD is not the memory itself, but the way the memory is stored, what it seems to mean, and the understandable ways of coping that keep both in place.',
  sections: [
    { h: 'The cycle', blocks: [
      { p: 'The most widely used explanation comes from the cognitive model of PTSD, the basis of cognitive therapy for PTSD. It describes why the danger can feel present long after it is over, and points to the places where treatment can break the cycle.', g: 'mod', r: 'EHLERS_MODEL' },
      { fig: 'cycle' } ] },
    { h: 'A memory that has not been filed as past', blocks: [
      { fig: 'memory' },
      { p: 'Unwanted memories in PTSD are mostly sensory: an image, a sound, a smell, a body feeling, rather than a story. They often replay the moments when things got worse, or the warning signs just before. Because they are poorly linked to their time and place, they can arrive with the feelings of then.', g: 'mod', r: 'INTRUSIONS BREWIN' },
      { p: 'This is why the Then-and-now tools in this app ask you to spot what is different now. Learning to tell a reminder from the original danger is a core skill in cognitive therapy for PTSD.', g: 'mod', r: 'CTPTSD' } ] },
    { h: 'What it seems to mean', blocks: [
      { p: 'Conclusions drawn in the worst moment ("I am weak", "It was my fault", "Nowhere is safe") are strongly linked with PTSD. These beliefs can feel like facts, but they were formed under extreme threat and are often coloured by hindsight: judging the past using what you only learned later.', g: 'mod', r: 'APPRAISALS' } ] },
    { h: 'Coping that backfires', blocks: [
      { p: 'Avoiding reminders, pushing memories away, going over and over what happened, staying on constant guard and using alcohol all make sense. They bring short-term relief. But they prevent the memory and its meanings from being updated, so the sense of threat stays.', g: 'mod', r: 'EHLERS_MODEL ALCOHOL' },
      { p: 'Make the cycle your own in <a href="#/map">My PTSD map</a>.', g: '', r: '', html: true } ] }
  ]
},
{
  id: 'alarm', scene: 'vigilance', tone: 'teal',
  title: 'The body\'s alarm', eyebrow: 'Understand it',
  lede: 'An alarm system built to keep you alive, learning too well that the world is dangerous.',
  sections: [
    { h: 'The brain\'s alarm system', blocks: [
      { fig: 'brain' },
      { p: 'Fear is a fast, protective system. When it works well, it fires in real danger and settles once you are safe. In PTSD it fires at reminders too, and it is slower to learn that something has become safe. In laboratory studies, people with anxiety disorders, including PTSD, reacted more to safety signals and unlearned fear more slowly than people without them.', g: 'mod', r: 'FEARCOND' } ] },
    { h: 'When you are outside your window', blocks: [
      { fig: 'window' },
      { p: 'When the alarm fires, people tend to go above their window (panic, rage, a racing heart) or below it (numb, far away, shut down). The steadying tools in this app are for getting back inside it. Practise them when you are calm, so they are there when you need them.', g: 'weak', r: '' } ] },
    { h: 'About polyvagal theory', blocks: [
      { p: 'You may hear PTSD explained with polyvagal theory, which links particular reactions to particular branches of the vagus nerve (a nerve connecting the brain with the heart and gut). A detailed review concluded that its specific claims about the vagus nerve are not supported by the physiology. The broader point, that the body has automatic threat responses that can be calmed, stands on other evidence.', g: 'no', r: 'POLYVAGAL' } ] }
  ]
},
{
  id: 'treatment', scene: 'healing', tone: 'green',
  title: 'Treatments that work', eyebrow: 'Get better',
  lede: 'PTSD is one of the most treatable mental health conditions. The best-tested treatments focus on the trauma itself, at a pace you can manage.',
  sections: [
    { h: 'What the guidelines recommend', blocks: [
      { p: 'Australia\'s guidelines, approved by the National Health and Medical Research Council, recommend trauma-focused psychological therapy as the first choice for adults with PTSD. "Trauma-focused" means the therapy works directly with the memory of the trauma and its meaning, rather than only with stress or day-to-day problems. Across 114 trials with 8,171 people, these therapies had clinically important benefits.', g: 'strong', r: 'PHOENIX LEWIS2020' },
      { tx: 'ptsd' } ] },
    { h: 'What therapy is like', blocks: [
      { p: 'Most trauma-focused therapies are designed to take about 12 weekly sessions, with practice between them; written exposure therapy takes five. Some can be delivered intensively: in one trial, a week of daily cognitive therapy worked as well as three months of weekly sessions, and about three in four people recovered either way.', g: 'strong', r: 'CTPTSD WET' },
      { fig: 'alarm' },
      { p: 'Therapy can feel harder before it feels easier. In a study of women with long-standing PTSD in exposure therapy, only a minority had a temporary rise in symptoms, and they did as well in the end as everyone else. About 1 in 6 people stop therapy early, so tell your therapist if the pace is too much: they can adjust it.', g: 'mod', r: 'EXACERBATE DROPOUT' } ] },
    { h: 'If the trauma was repeated or began in childhood', blocks: [
      { p: 'Trauma-focused therapies still help. In trials likely to include people with complex PTSD, they reduced PTSD symptoms and improved self-image and relationships, although results were poorer when the trauma began in childhood. A review found no good evidence that people must first complete a long "stabilisation" phase before trauma-focused work.', g: 'mod', r: 'CPTSD_TX CHILDABUSE STABILISE' } ] },
    { h: 'Medicines', blocks: [
      { p: 'Some antidepressants (sertraline, paroxetine, fluoxetine and venlafaxine) have small benefits and can help, for example when trauma-focused therapy is not available or has not helped enough. Australia\'s guidelines put trauma-focused therapy first and list these medicines as conditional options where medicine is needed. Prazosin, a blood-pressure medicine used for nightmares, did no better than placebo in the largest trial.', g: 'mod', r: 'MEDS PHOENIX PRAZOSIN' },
      { p: 'Benzodiazepines (sedatives such as diazepam) are not recommended: they did not treat or prevent PTSD and were linked with worse outcomes.', g: 'no', r: 'BENZO' } ] },
    { h: 'Getting treatment in Australia', blocks: [
      { p: 'Start with a GP. They can assess you, rule out other causes, prepare a mental health treatment plan and refer you to a psychologist. With the plan, Medicare\'s Better Access initiative gives you a rebate for up to 10 individual sessions each calendar year (checked November 2026). Ask the psychologist whether they offer a trauma-focused therapy such as cognitive processing therapy, cognitive therapy for PTSD, prolonged exposure or EMDR.', g: '', r: 'BETTERACCESS' },
      { p: 'Current and former Australian Defence Force members and their families can go straight to Open Arms (1800 011 046, 24 hours). Adults who experienced childhood trauma can call the Blue Knot Helpline (1300 657 380). People affected by sexual assault or domestic and family violence can call 1800RESPECT (1800 737 732, 24 hours). <a href="#/help">All help options</a>.', g: '', r: '', html: true } ] }
  ]
},
{
  id: 'selfhelp', scene: 'steadiness', tone: 'teal',
  title: 'Helping yourself', eyebrow: 'Get better',
  lede: 'What you can do yourself, how well it is supported, and where it fits alongside treatment.',
  sections: [
    { h: 'Self-help apps and guided online programmes', blocks: [
      { p: 'Guided online programmes based on trauma-focused CBT (cognitive behavioural therapy, a practical talking therapy) can work well. In a UK trial of 196 people with mild to moderate PTSD after a single event, an online programme with a few hours of therapist support worked as well as face-to-face therapy.', g: 'mod', r: 'RAPID ICBT_META' },
      { p: 'Unguided apps, including this one, have weaker evidence. In a trial of the free PTSD Coach app, more people improved meaningfully than those who waited, but average scores at the end did not differ significantly. Use Then and Now alongside professional care, not instead of it.', g: 'weak', r: 'PTSDCOACH INTERNET' } ] },
    { h: 'Sleep and nightmares', blocks: [
      { p: 'Cognitive behavioural therapy for insomnia (CBT-I) improved sleep a lot, and PTSD symptoms moderately, in 11 trials. Imagery rehearsal therapy, rewriting a recurring nightmare and rehearsing the new version while awake, reduced nightmares and improved sleep, with benefits lasting 6 to 12 months.', g: 'mod', r: 'CBTI_PTSD IRT AASM' } ] },
    { h: 'Moving your body', blocks: [
      { p: 'In 16 trials with 663 people, structured exercise reduced PTSD symptoms by a moderate amount. In a Sydney trial, adding 12 weeks of resistance training and walking to usual inpatient care reduced PTSD symptoms and improved depression and sleep.', g: 'mod', r: 'EXERCISE EXRCT' },
      { p: 'Yoga and mindfulness programmes also reduced symptoms in trials, though the evidence for yoga is of low quality. Neither is a first-line treatment for PTSD.', g: 'weak', r: 'YOGA MINDFUL MBSR PHOENIX' } ] },
    { h: 'Being kinder to yourself', blocks: [
      { p: 'People who treat themselves with more compassion tend to have fewer PTSD symptoms, and there are early signs that compassion-based approaches help. Shame and self-blame are common after trauma; they are worth working on, gently.', g: 'weak', r: 'SELFCOMP' } ] },
    { h: 'Alcohol and other drugs', blocks: [
      { p: 'Alcohol is one of the most common ways people try to switch off. It helps briefly, then worsens sleep, mood and the alarm, and it gets in the way of therapy. Across studies, between 10% and 61% of people with PTSD also misused alcohol. If you are drinking to cope, tell your GP; it can be treated at the same time as PTSD.', g: 'mod', r: 'ALCOHOL' },
      { p: 'Cannabis is often used for sleep and nightmares, but in a trial with 80 veterans, smoked cannabis was no better than placebo for PTSD symptoms.', g: 'no', r: 'CANNABIS' } ] }
  ]
},
{
  id: 'myths', scene: 'discernment', tone: 'gold',
  title: 'What the evidence does not support', eyebrow: 'Understand it',
  lede: 'Common beliefs about trauma and PTSD that research has tested and not borne out.',
  sections: [
    { h: '"Everyone should be debriefed straight after a trauma"', blocks: [
      { p: 'Single-session psychological debriefing soon after a traumatic event did not prevent PTSD, and in one trial more people had PTSD a year later after being debriefed. Practical and emotional support, and keeping an eye on how the person is doing over the following weeks, are recommended instead.', g: 'no', r: 'DEBRIEF PHOENIX' } ] },
    { h: '"Sedatives will calm it down"', blocks: [
      { p: 'Benzodiazepines were ineffective for treating or preventing PTSD and were linked with worse outcomes, including poorer results from therapy.', g: 'no', r: 'BENZO' } ] },
    { h: '"You have to be stable before you can face the trauma"', blocks: [
      { p: 'Feeling steadier helps, and safety comes first. But there is no good evidence that people with complex trauma must complete a long stabilisation phase before trauma-focused therapy, or that they cannot benefit from it.', g: 'no', r: 'STABILISE CPTSD_TX' } ] },
    { h: '"Talking about it will make it worse"', blocks: [
      { p: 'Approaching the memory with a trained therapist is the part of treatment with the strongest evidence. A temporary rise in distress happens for a minority, and is not linked with a worse outcome.', g: 'no', r: 'EXACERBATE PE' } ] },
    { h: '"PTSD means the brain is permanently damaged"', blocks: [
      { p: 'Brain differences in PTSD are small and found on average across groups, not in each person. A smaller hippocampus can even be present before the trauma, as a risk factor. Most people with PTSD improve with treatment.', g: 'no', r: 'HIPPO TWINS LEWIS2020' } ] },
    { h: '"Only soldiers get PTSD"', blocks: [
      { p: 'In the general population, the traumas that account for most PTSD are interpersonal violence, especially sexual violence, and the sudden death of a loved one. Women are about twice as likely as men to have PTSD in Australia.', g: 'no', r: 'WMH_TYPES ABS' } ] }
  ]
}
];

/* Treatment table for the "Treatments that work" page. */
export const TX = {
  ptsd: [
    { t: 'Cognitive processing therapy (CPT)', d: 'Writing about and examining the beliefs the trauma left, often 12 sessions.', line: 'First choice', g: 'strong', r: 'CPT PHOENIX WET' },
    { t: 'Cognitive therapy for PTSD (CT-PTSD)', d: 'Updating the worst moments of the memory and their meaning, and reclaiming your life.', line: 'First choice', g: 'strong', r: 'CTPTSD PHOENIX' },
    { t: 'Prolonged exposure (PE)', d: 'Gradually approaching the memory and safe reminders until they lose their power.', line: 'First choice', g: 'strong', r: 'PE CUSACK' },
    { t: 'Trauma-focused CBT', d: 'A broader family of therapies combining the above parts.', line: 'First choice', g: 'strong', r: 'LEWIS2020 COCHRANE2013' },
    { t: 'EMDR', d: 'Eye movement desensitisation and reprocessing: holding the memory in mind while following side-to-side eye movements or taps.', line: 'First choice', g: 'mod', r: 'EMDR EYEMOV PHOENIX' },
    { t: 'Written exposure therapy', d: 'Five sessions of structured writing about the trauma.', line: 'Good evidence, shorter', g: 'mod', r: 'WET' },
    { t: 'Guided internet-based trauma-focused CBT', d: 'An online programme with some therapist support.', line: 'Good option for mild to moderate PTSD', g: 'mod', r: 'RAPID ICBT_META' },
    { t: 'Narrative exposure therapy', d: 'Telling your whole life story, including the traumas; often used after war, torture or displacement.', line: 'Mainly studied after war and displacement', g: 'mod', r: 'NET' },
    { t: 'Antidepressants (sertraline, paroxetine, fluoxetine, venlafaxine)', d: 'Small benefits. Therapy comes first; medicine can be added or used when therapy is not possible.', line: 'Conditional', g: 'mod', r: 'MEDS PHOENIX' },
    { t: 'MDMA-assisted therapy', d: 'Only by specially authorised psychiatrists in Australia; not approved in the US.', line: 'Experimental', g: 'weak', r: 'MDMA' },
    { t: 'Single-session debriefing', d: 'Talking through the event soon after it.', line: 'Not recommended', g: 'no', r: 'DEBRIEF' },
    { t: 'Benzodiazepines', d: 'Sedatives such as diazepam.', line: 'Not recommended', g: 'no', r: 'BENZO' }
  ]
};
