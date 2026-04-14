import { useState } from "react";

export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const rawValue = window.localStorage.getItem(key);
      return rawValue ? JSON.parse(rawValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const nextValue = value instanceof Function ? value(storedValue) : value;
      setStoredValue(nextValue);
      window.localStorage.setItem(key, JSON.stringify(nextValue));
    } catch {
      setStoredValue(value);
    }
  };

  return [storedValue, setValue];
}
