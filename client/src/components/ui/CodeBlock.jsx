import { useState, useMemo } from 'react';
import { useLanguageStore } from '../../stores/useLanguageStore.js';

export default function CodeBlock({ codeBlocks }) {
  const { languages } = useLanguageStore();

  /*
   * Build a lookup map from slug -> language object (for icon display)
   */
  const langMap = useMemo(() => {
    const map = {};
    languages.forEach(l => { map[l.slug] = l; });
    return map;
  }, [languages]);

  const [activeLang, setActiveLang] = useState(
    codeBlocks?.[0]?.language || 'python'
  );

  const activeCode = codeBlocks?.find(b => b.language === activeLang);
  const availableLangs = codeBlocks?.map(b => b.language) || [];

  const handleCopy = () => {
    if (activeCode?.code) {
      navigator.clipboard.writeText(activeCode.code);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block__header">
        <div className="code-block__tabs">
          {availableLangs.map(lang => {
            const langInfo = langMap[lang];
            return (
              <button
                key={lang}
                className={`code-block__tab ${activeLang === lang ? 'code-block__tab--active' : ''}`}
                onClick={() => setActiveLang(lang)}
              >
                {langInfo?.imageUrl ? (
                  <img src={langInfo.imageUrl} alt={langInfo.name || lang} className="code-block__tab-icon" />
                ) : (
                  langInfo?.name || lang
                )}
              </button>
            );
          })}
        </div>
        <button className="code-block__copy" onClick={handleCopy}>Copy</button>
      </div>
      <div className="code-block__body">
        <pre>{activeCode?.code || '// Select a language'}</pre>
      </div>
    </div>
  );
}
