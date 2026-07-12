import { useState } from "react";

export const useUndo = <T>(initialPresent: T) => {
  const [state, setState] = useState({
    past: [] as T[],
    present: initialPresent,
    future: [] as T[],
  });
}