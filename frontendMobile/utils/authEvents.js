/**
 * Pubsub mínimo para desacoplar api.js (fuera del árbol de React)
 * de AuthContext. En web el interceptor usaba window.location;
 * en RN no hay eso, así que emitimos un evento y AuthContext decide.
 */
const listeners = new Set();

export const authEvents = {
    onUnauthorized: (callback) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
    },
    emitUnauthorized: () => {
        listeners.forEach((cb) => cb());
    },
};

export default authEvents;