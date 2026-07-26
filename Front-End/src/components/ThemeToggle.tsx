import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <style>{`
        .theme-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          background: var(--color-bg-elevated);
          transition: background var(--transition), color var(--transition), border-color var(--transition);
        }
        .theme-toggle:hover {
          color: var(--color-text);
          background: var(--color-bg-muted);
          border-color: var(--color-border-strong);
        }
      `}</style>
    </button>
  );
}
