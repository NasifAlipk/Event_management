export default function GoogleIcon({ size = 20, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.7 2.92-4.2 2.92-7.24Z"
      />
      <path
        fill="#34A853"
        d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.74 9.74 0 0 0 12 21.6Z"
      />
      <path
        fill="#FBBC05"
        d="M6.53 13.69a5.84 5.84 0 0 1 0-3.38V7.79H3.28a9.6 9.6 0 0 0 0 8.42l3.25-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.28c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.36 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.72 5.39l3.25 2.52C7.3 8 9.46 6.28 12 6.28Z"
      />
    </svg>
  );
}
