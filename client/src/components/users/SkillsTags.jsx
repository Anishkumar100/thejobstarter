export default function SkillsTags({ skills }) {
  if (!skills?.length) return null;

  return (
    <div className="profile-skills">
      {skills.map(skill => (
        <span key={skill} className="tag" style={{ background: 'var(--bg-inverse)', color: 'var(--text-inverse)', fontWeight: 600 }}>
          {skill}
        </span>
      ))}
    </div>
  );
}
