'use client';

// Announces new orders anywhere in the admin: a chime, a toast, and a count
// on the bell in the top bar. Wrapped around the authenticated admin only, so
// it never runs a listener for a customer browsing the store.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { subscribeToOrders } from '@/lib/db';
import { playOrderChime, primeAudio } from '@/lib/alertSound';

const OrderAlertContext = createContext({
  orders: [],
  connected: false,
  newOrders: [],
  unread: 0,
  markAllRead: () => {},
  soundOn: true,
  setSoundOn: () => {},
  desktopOn: false,
  enableDesktop: () => {},
  testChime: () => {},
});

const SOUND_KEY = 'lp24.admin.orderSound';
const DESKTOP_KEY = 'lp24.admin.orderDesktop';

export function OrderAlertProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);
  const [newOrders, setNewOrders] = useState([]);
  const [unread, setUnread] = useState(0);
  const [soundOn, setSoundOnState] = useState(true);
  const [desktopOn, setDesktopOn] = useState(false);

  // Ids present when the listener first connected. Everything already in the
  // shop's history is "seen"; only documents that appear afterwards are new.
  const knownIds = useRef(null);
  // Read inside the snapshot callback, which is registered once — refs keep
  // them current without tearing the listener down on every preference change.
  const soundRef = useRef(true);
  const desktopRef = useRef(false);

  useEffect(() => {
    try {
      const savedSound = localStorage.getItem(SOUND_KEY);
      if (savedSound !== null) {
        const on = savedSound === '1';
        setSoundOnState(on);
        soundRef.current = on;
      }
      const savedDesktop = localStorage.getItem(DESKTOP_KEY) === '1';
      const granted =
        typeof Notification !== 'undefined' && Notification.permission === 'granted';
      setDesktopOn(savedDesktop && granted);
      desktopRef.current = savedDesktop && granted;
    } catch {
      // Private browsing blocks localStorage; the defaults are fine.
    }
  }, []);

  // Unlock audio on the first interaction anywhere in the admin, so the chime
  // isn't silently swallowed by the browser's autoplay policy.
  useEffect(() => {
    const unlock = () => primeAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((docs) => {
      setOrders(docs);
      setConnected(true);

      if (knownIds.current === null) {
        knownIds.current = new Set(docs.map((d) => d.id));
        return;
      }

      const fresh = docs.filter((d) => !knownIds.current.has(d.id));
      if (fresh.length === 0) return;
      for (const order of fresh) knownIds.current.add(order.id);

      setNewOrders((prev) => [...fresh, ...prev].slice(0, 20));
      setUnread((n) => n + fresh.length);

      if (soundRef.current) playOrderChime();

      for (const order of fresh) {
        toast.success(
          `🧾 ${order.orderNumber} — ${order.customerName || ''}`.trim(),
          { duration: 8000 }
        );
        if (desktopRef.current && typeof Notification !== 'undefined') {
          try {
            new Notification('LuxuryPhone24 — new order', {
              body: `${order.orderNumber} · ${order.productName || ''}`,
              tag: order.id,
            });
          } catch {
            // Some browsers only allow notifications from a service worker.
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  const setSoundOn = useCallback((on) => {
    setSoundOnState(on);
    soundRef.current = on;
    try {
      localStorage.setItem(SOUND_KEY, on ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (on) {
      primeAudio();
      playOrderChime();
    }
  }, []);

  const enableDesktop = useCallback(async () => {
    if (typeof Notification === 'undefined') return false;
    if (desktopOn) {
      setDesktopOn(false);
      desktopRef.current = false;
      try {
        localStorage.setItem(DESKTOP_KEY, '0');
      } catch {
        /* ignore */
      }
      return false;
    }
    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
    const on = permission === 'granted';
    setDesktopOn(on);
    desktopRef.current = on;
    try {
      localStorage.setItem(DESKTOP_KEY, on ? '1' : '0');
    } catch {
      /* ignore */
    }
    return on;
  }, [desktopOn]);

  const markAllRead = useCallback(() => setUnread(0), []);

  const testChime = useCallback(() => {
    primeAudio();
    playOrderChime();
  }, []);

  return (
    <OrderAlertContext.Provider
      value={{
        orders,
        connected,
        newOrders,
        unread,
        markAllRead,
        soundOn,
        setSoundOn,
        desktopOn,
        enableDesktop,
        testChime,
      }}
    >
      {children}
    </OrderAlertContext.Provider>
  );
}

export const useOrderAlerts = () => useContext(OrderAlertContext);
