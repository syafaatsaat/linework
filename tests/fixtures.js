// Sample CV shared by the unit and browser tests. Content is made up.

export const general = {
  name: 'Ada Tan',
  email: 'ada@example.com',
  phone: '+65 8123 4567',
  country: 'Singapore',
  linkedin: 'https://www.linkedin.com/in/adatan/',
  portfolio: 'adatan.dev',
  summary: 'Frontend engineer with six years of experience building accessible web apps in React.',
}

export const sample = {
  order: ['general', 'skills', 'exp', 'edu', 'projects'],
  committed: {
    general: [general],
    skills: [
      { category: 'Frontend', items: 'React, TypeScript, CSS' },
      { category: 'Tools', items: 'Vite, Playwright' },
    ],
    exp: [
      {
        company: 'Acme Pte Ltd',
        position: 'Senior Frontend Engineer',
        responsibilities: '- Led the design system rebuild\n• Cut bundle size by 40%',
        from: '2021-03',
        until: '',
      },
      {
        company: 'Globex',
        position: 'Frontend Developer',
        responsibilities: 'Built the checkout flow',
        from: '2018-07',
        until: '2021-02',
      },
    ],
    edu: [{ school: 'National University of Singapore', titleOfStudy: 'BSc Computer Science', from: '2014-08', to: '2018-05' }],
    projects: [{ name: 'Linework', link: 'https://github.com/ada/linework', description: 'A CV builder.' }],
  },
}
