const VARIANTS = {
  primary:   'bg-gray-800 hover:bg-gray-700 text-white border-transparent',
  secondary: 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300',
  danger:    'bg-red-600 hover:bg-red-700 text-white border-transparent',
  ghost:     'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
};

const SIZES = {
  sm:   'px-3 py-1.5 text-xs',
  md:   'px-4 py-2.5 text-sm',
  lg:   'px-6 py-3 text-base',
  full: 'w-full px-4 py-2.5 text-sm',
};

const Button = ({
  children,
  type      = 'button',
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  isLoading = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg border
        transition-colors duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
    >
      {/* Spinner when loading */}
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
