import React, { useMemo } from "react";

export default function SelectInput({
  label,
  name,
  options,
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  register,
  required,
}) {
  const normalizedOptions = useMemo(() => options || [], [options]);

  const selectProps = register
    ? { ...register(name, required ? { required } : undefined) }
    : { value: value ?? "", onChange };

  return (
    <div className="space-y-2">
      {label ? (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor={name}>
          {label}
        </label>
      ) : null}
      <select
        id={name}
        name={name}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none ring-blue-500/30 focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-50 dark:bg-gray-800 dark:text-white ${
          error ? "border-red-400" : "border-gray-300 dark:border-gray-600"
        }`}
        {...selectProps}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {normalizedOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

