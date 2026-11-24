function Input({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="form-group">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}

export default Input;