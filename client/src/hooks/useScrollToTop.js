import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/*
 * useScrollToTop — Scrolls the page to the top on every route change.
 *
 * Drop this into the top-level App component (or any component rendered
 * inside <Router>) and it will automatically fire window.scrollTo(0, 0)
 * whenever the pathname changes.
 *
 * Usage:
 *   import { useScrollToTop } from './hooks/useScrollToTop.js';
 *   function App() {
 *     useScrollToTop();
 *     return <Routes>...</Routes>;
 *   }
 */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
}
