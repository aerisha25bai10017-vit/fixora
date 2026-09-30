import React, { useEffect, useRef, useState, useCallback } from 'react';

// Character pool excluding ambiguous characters (0, O, 1, I, l)
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

export default function Captcha({
  value = '',
  onChange,
  onCodeChange,
  isError = false,
  theme = 'light',
}) {
  const canvasRef = useRef(null);
  const [currentCode, setCurrentCode] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Generate a random 6-character string
  const generateRandomCode = useCallback((length = 6) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return result;
  }, []);

  // Draw the captcha on HTML5 canvas with noise, waves, and distorted characters
  const drawCaptcha = useCallback((text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Canvas background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isDark ? '#232833' : '#fdf8ee';
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid/dots
    const dotColors = isDark
      ? ['rgba(245, 185, 77, 0.25)', 'rgba(63, 179, 159, 0.25)', 'rgba(91, 155, 217, 0.25)']
      : ['rgba(242, 169, 59, 0.3)', 'rgba(31, 122, 108, 0.3)', 'rgba(43, 108, 176, 0.3)'];

    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = dotColors[Math.floor(Math.random() * dotColors.length)];
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 + 0.8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Curving distraction/noise lines in theme colors
    const lineColors = isDark
      ? ['#f5b94d', '#3fb39f', '#e4694f', '#5b9bd9']
      : ['#f2a93b', '#1f7a6c', '#d8503a', '#2b6cb0'];

    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = lineColors[i % lineColors.length];
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      ctx.bezierCurveTo(
        width * 0.25,
        Math.random() * height,
        width * 0.75,
        Math.random() * height,
        width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Palette for individual characters
    const charColors = isDark
      ? ['#ffd166', '#48cae4', '#ff758f', '#a0c4ff', '#b9fbc0', '#f4a261']
      : ['#b8860b', '#1f7a6c', '#d8503a', '#2b6cb0', '#7a3fb3', '#2d6a4f'];

    // Render each character with individual rotation, size, and vertical offset
    const charSpacing = width / (text.length + 1);

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.save();

      const x = (i + 1) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);

      // Random font size and rotation between -20deg and +20deg
      const fontSize = Math.floor(Math.random() * 6) + 24; // 24px - 30px
      const angle = (Math.random() * 36 - 18) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = charColors[i % charColors.length];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Soft text shadow for extra depth
      ctx.shadowColor = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Additional cross-through line to deter OCR while remaining human-readable
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(42, 36, 28, 0.2)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(10, Math.random() * 20 + height / 2 - 10);
    ctx.lineTo(width - 10, Math.random() * 20 + height / 2 - 10);
    ctx.stroke();
  }, []);

  // Regenerate captcha
  const refreshCaptcha = useCallback(() => {
    setIsSpinning(true);
    const newCode = generateRandomCode(6);
    setCurrentCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
    setTimeout(() => {
      drawCaptcha(newCode);
      setIsSpinning(false);
    }, 120);
  }, [drawCaptcha, generateRandomCode, onCodeChange]);

  // Initial render
  useEffect(() => {
    refreshCaptcha();
  }, []);

  // Re-draw when theme changes
  useEffect(() => {
    if (currentCode) {
      drawCaptcha(currentCode);
    }
  }, [theme, currentCode, drawCaptcha]);

  // Accessible audio readout
  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window) || !currentCode) return;

    window.speechSynthesis.cancel(); // Stop any pending speech
    setIsPlayingAudio(true);

    // Read characters spaced out with punctuation for clarity
    const spokenText = currentCode
      .split('')
      .map((c) => (c === c.toUpperCase() ? `capital ${c}` : c))
      .join(', ');

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.8; // slightly slower for high clarity
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const isMatched =
    value.trim().length === currentCode.length &&
    value.trim().toLowerCase() === currentCode.toLowerCase();

  return (
    <div className={`captcha-box ${isError ? 'captcha-shake' : ''}`}>
      <div className="captcha-header">
        <label className="captcha-label" htmlFor="captcha-input-field">
          <span className="captcha-label-icon">🛡️</span>
          <span>Security Verification</span>
        </label>
        {isMatched && <span className="captcha-match-badge">✓ Verified</span>}
      </div>

      <div className="captcha-body">
        {/* Canvas displaying distorted code */}
        <div className="captcha-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={260}
            height={52}
            className="captcha-canvas"
            title="CAPTCHA Image"
          />
        </div>

        {/* Action buttons: Refresh and Audio Readout */}
        <div className="captcha-tools">
          <button
            type="button"
            className={`captcha-tool-btn ${isSpinning ? 'spinning' : ''}`}
            onClick={refreshCaptcha}
            title="Get a new CAPTCHA code"
            aria-label="Refresh CAPTCHA"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
            </svg>
          </button>

          <button
            type="button"
            className={`captcha-tool-btn ${isPlayingAudio ? 'playing' : ''}`}
            onClick={handlePlayAudio}
            title="Listen to CAPTCHA code"
            aria-label="Play CAPTCHA audio"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Input row */}
      <div className="captcha-input-wrap">
        <input
          id="captcha-input-field"
          type="text"
          maxLength={6}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="Enter the 6 characters shown"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`captcha-input ${isMatched ? 'captcha-input-matched' : ''} ${
            isError ? 'captcha-input-error' : ''
          }`}
          required
        />
      </div>
      <span className="captcha-hint">
        Type the characters above to prove you're human. Case-insensitive.
      </span>
    </div>
  );
}
