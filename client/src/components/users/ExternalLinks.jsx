import { GithubIcon, Linkedin01Icon, LeetcodeIcon, HackerrankIcon, CodeCircleIcon, GlobeIcon } from 'hugeicons-react';

const PLATFORM_ICONS = {
  leetcode: <LeetcodeIcon size={24} />,
  github: <GithubIcon size={24} />,
  linkedin: <Linkedin01Icon size={24} />,
  website: <GlobeIcon size={24} />,
  hackerrank: <HackerrankIcon size={24} />,
  codeforces: <CodeCircleIcon size={24} />,
  codechef: <CodeCircleIcon size={24} />
};

const PLATFORM_COLORS = {
  leetcode: '#ffa116',
  github: '#333',
  linkedin: '#0a66c2',
  website: '#000',
  hackerrank: '#00ea64',
  codeforces: '#1f8acb',
  codechef: '#5b4638'
};

export default function ExternalLinks({ links }) {
  if (!links?.length) return null;

  return (
    <div className="profile-links">
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link-icon"
          style={{ '--platform-color': PLATFORM_COLORS[link.platform] || '#000' }}
          title={link.label || link.platform}
        >
          {PLATFORM_ICONS[link.platform] || <CodeCircleIcon size={24} />}
        </a>
      ))}
    </div>
  );
}
