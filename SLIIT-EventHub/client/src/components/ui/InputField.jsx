const InputField = ({
  label,
  id,
  type      = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled  = false,
  required  = false,
}) => {
  const hasError = touched && error;

  return (
    <div className="flex flex-col gap-1">

      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-gray-600"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Input */}
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 rounded-lg border text-sm
          bg-white text-gray-800 placeholder-gray-400
          focus:outline-none focus:ring-2 transition-colors
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${hasError
            ? 'border-red-400 focus:ring-red-200'
            : 'border-gray-300 focus:ring-gray-300 hover:border-gray-400'
          }
        `}
      />

      {/* Error message */}
      {hasError && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
};

export default InputField;
