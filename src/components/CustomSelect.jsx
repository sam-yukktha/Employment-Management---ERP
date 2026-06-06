import { useState, useRef, useEffect } from "react";

const CustomSelect = ({ value, onChange, options, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`custom-select-container ${className}`} ref={containerRef}>
      <div
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="custom-select-arrow">▼</span>
      </div>
      {isOpen && (
        <ul className="custom-select-options">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                className={`custom-select-option ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  onChange({ target: { value: opt.value } });
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
