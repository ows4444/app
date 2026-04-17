type Listener<T> = (payload: T) => void;

function createEvent<T>() {
  const listeners = new Set<Listener<T>>();

  return {
    emit(payload: T) {
      for (const l of listeners) l(payload);
    },
    subscribe(listener: Listener<T>) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
}

export const networkEvents = {
  online: createEvent<boolean>(),
  slow: createEvent<boolean>(),
};
