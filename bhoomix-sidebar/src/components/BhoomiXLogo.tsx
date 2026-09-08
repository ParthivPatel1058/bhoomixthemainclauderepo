import React from 'react';
import { motion } from 'motion/react';

export interface BhoomiXLogoProps {
  theme?: 'dark' | 'light';
  collapsed?: boolean;
  className?: string;
  onClick?: () => void;
}

export const LeafIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Stylized BhoomiX agricultural leaf emblem */}
    <path
      d="M20.4 3.6C16.8 3.3 12.2 4.9 9.3 7.8C6.3 10.8 4.7 15.3 5 19C8.7 19.3 13.2 17.7 16.2 14.7C19.2 11.7 20.7 7.3 20.4 3.6Z"
      opacity="0.95"
    />
    <path
      d="M5 19C9.5 15.5 14 11 19 5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="text-current opacity-20"
    />
  </svg>
);

export const BhoomiXLogo: React.FC<BhoomiXLogoProps> = ({
  theme = 'dark',
  collapsed = false,
  className = '',
  onClick,
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-[#110F13]';
  const leafColor = isDark ? 'text-white' : 'text-[#110F13]';

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center select-none cursor-pointer overflow-hidden ${className}`}
    >
      <motion.div
        animate={{ rotate: collapsed ? 0 : -12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className={`w-8 h-8 flex items-center justify-center shrink-0 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-neutral-100'
        } ${leafColor}`}
      >
        <LeafIcon className="w-4 h-4 text-[#8AC637]" />
      </motion.div>

      <div
        className="flex items-center min-w-0 pl-3 transition-opacity duration-150 overflow-hidden"
        style={{
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? 'none' : 'auto',
        }}
      >
        <span
          className={`text-[17px] font-bold tracking-tight ${textColor} whitespace-nowrap`}
        >
          Bhoomi<span className="text-[#8AC637]">X</span>
        </span>
      </div>
    </motion.div>
  );
};

export const MedtbankLogo = BhoomiXLogo;
export default BhoomiXLogo;
