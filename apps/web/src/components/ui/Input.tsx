import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    const classes = `${error ? 'input-error' : 'input'} ${className}`.trim();

    return <input ref={ref} className={classes} {...props} />;
  }
);

Input.displayName = 'Input';

export default Input;
