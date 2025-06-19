
'use client';

import { useEffect } from 'react';
import { getDatabase, ref, onValue, onDisconnect, set, serverTimestamp, Unsubscribe } from 'firebase/database';
import { useAuth } from './useAuth';
import { rtdb } from '../lib/firebase'; // Use the exported rtdb instance

// const db = getDatabase(app); // Not needed if rtdb is imported directly

export const usePresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !rtdb) {
      return; 
    }

    const userStatusRef = ref(rtdb, `/status/${user.uid}`);
    const connectedRef = ref(rtdb, '.info/connected');

    let listener: Unsubscribe | undefined;

    // Wrap onValue in a variable to ensure it can be unsubscribed
    const connectionListener = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(userStatusRef)
          .set({ state: 'offline', last_changed: serverTimestamp() })
          .then(() => {
            set(userStatusRef, {
              state: 'online',
              last_changed: serverTimestamp(),
            });
          })
          .catch((err) => {
            console.error("Could not establish onDisconnect handler", err);
          });
      }
    });
    
    // Assign the listener function itself to the variable for cleanup
    listener = () => {
      // Firebase onValue returns a function to unsubscribe.
      // However, the way onValue is structured, connectionListener itself is the unsubscribe function here.
      // For clarity and safety, though, this direct assignment might be confusing.
      // Let's ensure connectedRef's listener is properly cleaned up.
      // The onValue function returns an unsubscribe function, so assign that.
      // This part is tricky as `onValue` itself IS the unsubscribe function when called like this.
      // So, the original structure for cleanup `listener()` was okay, but let's be explicit.
      // The Firebase SDK's `onValue` when directly assigned, doesn't return an unsubscribe.
      // It needs to be called as: `const unsubscribe = onValue(...)`, then call `unsubscribe()`.
      // The provided code example was slightly off in how it handled the listener variable.
      // For this specific case, we'll just detach all listeners on this path, or make sure it's done right.

      // Correct way to get an unsubscribe function from onValue:
      // The onValue function directly returns the unsubscribe function in some SDK versions or contexts
      // but it's safer to manage it this way if it's complex:
      // For .info/connected, it's simple.
      // The primary concern is the onDisconnect handler.
      // Let's rely on the onDisconnect to clear status and ensure the listener on '.info/connected' is off.
      // To detach the onValue listener, we actually need to call it with no callback:
      // ref(db, '.info/connected').off('value', connectionListener); This is for older SDKs.
      // For modular SDK, the returned function from onValue is the unsubscriber.
      // The way connectionListener is defined *is* the unsubscribe function.
      // Let's make it very clear.
    };
    
    const unsubscribeConnectedListener = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          onDisconnect(userStatusRef)
            .set({ state: 'offline', last_changed: serverTimestamp() })
            .then(() => {
              set(userStatusRef, {
                state: 'online',
                last_changed: serverTimestamp(),
              });
            })
            .catch((err) => {
              console.error("Could not establish onDisconnect handler in usePresence", err);
            });
        }
      });


    return () => {
      unsubscribeConnectedListener(); // Correctly unsubscribe
      // If user explicitly logs out, we can set their status to offline immediately.
      // However, onDisconnect handles abrupt disconnections (browser close, network loss).
      // For a clean logout, you might want an additional explicit 'offline' set,
      // but it's often handled by onDisconnect eventually.
      // For now, relying on onDisconnect is fine as per the original plan.
      // If we want to be more proactive on logout:
      // if (user) {
      //   set(userStatusRef, { state: 'offline', last_changed: serverTimestamp() });
      // }
    };
  }, [user, rtdb]);
};
