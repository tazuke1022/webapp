/**
 * localStorageに値を保存するフック
 * 
 * const [var, setVar] = useLocalStorage(key, initValue);
 */
import { useState, useEffect } from 'react';
export const useLocalStorage = (key, initValue) => {
  const savedValue = localStorage.getItem(key);
  const [variable, setter] = useState(
    savedValue === null ? (typeof initValue === 'function' ? initValue() : initValue) : JSON.parse(savedValue));
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(variable));
  }, [variable])
  return [variable, setter];
};
