import React, { useState, useEffect, useRef } from 'react';
import { useHaptics } from '../../hooks/useHaptics';

const NativeInput = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = '',
  error = null,
  disabled = false,
  required = false,
  autoComplete = 'off',
  inputMode = 'text',
  pattern = null,
  maxLength = null,
  minLength = null,
  icon = null,
  iconPosition = 'left',
  clearable = false,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  const inputRef = useRef(null);
  const haptics = useHaptics();

  useEffect(() => {
    setHasValue(Boolean(value));
  }, [value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    haptics.light();
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setHasValue(Boolean(newValue));
    onChange?.(e);
  };

  const handleClear = () => {
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' }
      };
      onChange(syntheticEvent);
    }
    haptics.light();
    inputRef.current?.focus();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    haptics.light();
  };

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getInputMode = () => {
    if (inputMode !== 'text') return inputMode;
    
    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'number':
        return 'numeric';
      case 'url':
        return 'url';
      default:
        return 'text';
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <div className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
        iconPosition === 'left' ? 'left-3' : 'right-3'
      }`}>
        {icon}
      </div>
    );
  };

  const renderPasswordToggle = () => {
    if (type !== 'password') return null;
    
    return (
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        onClick={togglePasswordVisibility}
      >
        {showPassword ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.46 8.46m1.418 1.418l4.242 4.242M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    );
  };

  const renderClearButton = () => {
    if (!clearable || !hasValue || disabled) return null;
    
    return (
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        onClick={handleClear}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    );
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label 
          className={`block text-sm font-medium mb-2 transition-colors ${
            error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type={getInputType()}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          inputMode={getInputMode()}
          pattern={pattern}
          maxLength={maxLength}
          minLength={minLength}
          className={`
            w-full px-4 py-3 text-base bg-white dark:bg-gray-800 
            border-2 rounded-ios transition-all duration-200
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${type === 'password' ? 'pr-10' : ''}
            ${clearable && hasValue ? 'pr-10' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500 focus:ring-opacity-10' 
              : isFocused 
                ? 'border-primary-500 focus:border-primary-500 focus:ring-4 focus:ring-primary-500 focus:ring-opacity-10'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${disabled 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'text-gray-900 dark:text-gray-100'
            }
            ${className}
          `}
          {...props}
        />
        
        {renderIcon()}
        {renderPasswordToggle()}
        {renderClearButton()}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default NativeInput; 