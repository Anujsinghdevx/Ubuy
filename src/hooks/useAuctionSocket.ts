'use client';

import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { clientEnv } from '@/config/env.client';
import type {
  AuctionCancelledEvent,
  AuctionDeletedEvent,
  AuctionEndedEvent,
  AuctionEventPayload,
  AuctionWinnerChangedEvent,
  NewBidEvent,
  NotificationNewEvent,
  OutBidEvent,
  PaymentConfirmedEvent,
  PlaceBidAck,
  PlaceBidInput,
} from '@/types/socket';

type UseAuctionSocketOptions = {
  auctionId?: string;
  token?: string | null;
  onNewBid?: (payload: NewBidEvent) => void;
  onNotificationNew?: (payload: NotificationNewEvent) => void;
  onOutBid?: (payload: OutBidEvent) => void;
  onAuctionEnded?: (payload: AuctionEndedEvent) => void;
  onAuctionWinnerChanged?: (payload: AuctionWinnerChangedEvent) => void;
  onPaymentConfirmed?: (payload: PaymentConfirmedEvent) => void;
  onAuctionCancelled?: (payload: AuctionCancelledEvent) => void;
  onAuctionDeleted?: (payload: AuctionDeletedEvent) => void;
  onConnectError?: (message: string) => void;
  onSocketError?: (message: string) => void;
  onReconnect?: () => void;
};

type AuctionSocketControls = {
  socketRef: MutableRefObject<Socket | null>;
  isConnected: () => boolean;
  joinAuction: (targetAuctionId?: string) => void;
  leaveAuction: (targetAuctionId?: string) => void;
  placeBid: (input: PlaceBidInput) => Promise<PlaceBidAck>;
};

const CONNECT_TIMEOUT_MS = 5000;
const BID_ACK_TIMEOUT_MS = 8000;

const getSocketUrl = () => {
  const candidate =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    clientEnv.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    clientEnv.NEXT_PUBLIC_API_BASE_URL ||
    '';

  const trimmed = candidate.replace(/\/$/, '');
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed;
  }
};

const getPayload = (data: unknown): AuctionEventPayload => {
  if (data && typeof data === 'object') return data as AuctionEventPayload;
  return { value: data };
};

const toRecord = (value: unknown): AuctionEventPayload | null => {
  if (!value || typeof value !== 'object') return null;
  return value as AuctionEventPayload;
};

const toStringValue = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim() ? value : undefined;
};

const toNumberValue = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const parseNewBidPayload = (data: unknown, fallbackAuctionId?: string): NewBidEvent => {
  const payload = getPayload(data);
  const bidder = toRecord(payload.bidder);

  return {
    auctionId: toStringValue(payload.auctionId) || fallbackAuctionId || '',
    amount: toNumberValue(payload.amount) ?? 0,
    userId: toStringValue(payload.userId),
    bidderId: toStringValue(payload.bidderId),
    bidderName: toStringValue(payload.bidderName),
    bidTime: toStringValue(payload.bidTime),
    _id: toStringValue(payload._id),
    bidder: bidder
      ? {
          _id: toStringValue(bidder._id),
          name: toStringValue(bidder.name),
        }
      : undefined,
  };
};

const parseOutBidPayload = (data: unknown, fallbackAuctionId?: string): OutBidEvent => {
  const payload = getPayload(data);

  return {
    auctionId: toStringValue(payload.auctionId) || fallbackAuctionId || '',
    previousAmount: toNumberValue(payload.previousAmount),
    newAmount: toNumberValue(payload.newAmount),
    outbidBy: toStringValue(payload.outbidBy),
    amount: toNumberValue(payload.amount),
    message: toStringValue(payload.message),
  };
};

const parseNotificationPayload = (data: unknown, fallbackAuctionId?: string): NotificationNewEvent => {
  const payload = getPayload(data);

  return {
    auctionId: toStringValue(payload.auctionId) || fallbackAuctionId,
    message: toStringValue(payload.message),
    title: toStringValue(payload.title),
    type: toStringValue(payload.type),
  };
};

const parseAuctionEndedPayload = (data: unknown, fallbackAuctionId?: string): AuctionEndedEvent => {
  const payload = getPayload(data);

  return {
    auctionId: toStringValue(payload.auctionId) || fallbackAuctionId || '',
    status: toStringValue(payload.status),
    endTime: toStringValue(payload.endTime),
  };
};

const parseAuctionWinnerChangedPayload = (
  data: unknown,
  fallbackAuctionId?: string
): AuctionWinnerChangedEvent => {
  const payload = getPayload(data);

  return {
    auctionId: toStringValue(payload.auctionId) || fallbackAuctionId || '',
    currentPrice: toNumberValue(payload.currentPrice),
    winnerId: toStringValue(payload.winnerId),
    winnerName: toStringValue(payload.winnerName),
  };
};

const parsePaymentConfirmedPayload = (
  data: unknown,
  fallbackAuctionId?: string
): PaymentConfirmedEvent => {
  const payload = getPayload(data);

  return {
    auctionId: toStringValue(payload.auctionId) || fallbackAuctionId || '',
    paymentStatus: toStringValue(payload.paymentStatus),
  };
};

const parseAuctionCancelledPayload = (
  data: unknown,
  fallbackAuctionId?: string
): AuctionCancelledEvent => {
  const payload = getPayload(data);

  return {
    auctionId: toStringValue(payload.auctionId) || fallbackAuctionId || '',
    reason: toStringValue(payload.reason),
    status: toStringValue(payload.status),
  };
};

const parseAuctionDeletedPayload = (
  data: unknown,
  fallbackAuctionId?: string
): AuctionDeletedEvent => {
  const payload = getPayload(data);

  return {
    auctionId: toStringValue(payload.auctionId) || fallbackAuctionId || '',
    message: toStringValue(payload.message),
  };
};

const normalizeSocketError = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
  }
  return 'Socket error occurred.';
};

const parsePlaceBidAck = (ack: unknown): PlaceBidAck => {
  if (!ack || typeof ack !== 'object') {
    return { ok: false, error: 'Invalid bid response from server.' };
  }

  const record = ack as Record<string, unknown>;
  if (record.ok === true) {
    const payload =
      record.data && typeof record.data === 'object'
        ? (record.data as AuctionEventPayload)
        : getPayload(record.data);
    return { ok: true, data: payload };
  }

  if (record.ok === false) {
    return {
      ok: false,
      error:
        typeof record.error === 'string' && record.error.trim()
          ? record.error
          : 'Failed to place bid.',
    };
  }

  return { ok: false, error: 'Invalid bid response from server.' };
};

const waitForSocketConnection = async (
  socket: Socket,
  timeoutMs: number
): Promise<{ ok: true } | { ok: false; error: string }> => {
  if (socket.connected) return { ok: true };

  return new Promise((resolve) => {
    let settled = false;

    const done = (result: { ok: true } | { ok: false; error: string }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      resolve(result);
    };

    const handleConnect = () => done({ ok: true });
    const handleConnectError = (error: unknown) =>
      done({ ok: false, error: normalizeSocketError(error) });

    const timer = window.setTimeout(() => {
      done({ ok: false, error: 'Realtime connection timed out. Please try again.' });
    }, timeoutMs);

    socket.once('connect', handleConnect);
    socket.once('connect_error', handleConnectError);
    socket.connect();
  });
};

const parseEventErrorMessage = (payload: unknown): string | null => {
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) return record.message;
  if (typeof record.error === 'string' && record.error.trim()) return record.error;
  return null;
};

export const useAuctionSocket = ({
  auctionId,
  token,
  onNewBid,
  onNotificationNew,
  onOutBid,
  onAuctionEnded,
  onAuctionWinnerChanged,
  onPaymentConfirmed,
  onAuctionCancelled,
  onAuctionDeleted,
  onConnectError,
  onSocketError,
  onReconnect,
}: UseAuctionSocketOptions): AuctionSocketControls => {
  const socketRef = useRef<Socket | null>(null);
  const wasDisconnectedRef = useRef(false);
  const handlersRef = useRef({
    onNewBid,
    onNotificationNew,
    onOutBid,
    onAuctionEnded,
    onAuctionWinnerChanged,
    onPaymentConfirmed,
    onAuctionCancelled,
    onAuctionDeleted,
    onConnectError,
    onSocketError,
    onReconnect,
  });

  const socketUrl = useMemo(() => getSocketUrl(), []);

  useEffect(() => {
    handlersRef.current = {
      onNewBid,
      onNotificationNew,
      onOutBid,
      onAuctionEnded,
      onAuctionWinnerChanged,
      onPaymentConfirmed,
      onAuctionCancelled,
      onAuctionDeleted,
      onConnectError,
      onSocketError,
      onReconnect,
    };
  }, [
    onNewBid,
    onNotificationNew,
    onOutBid,
    onAuctionEnded,
    onAuctionWinnerChanged,
    onPaymentConfirmed,
    onAuctionCancelled,
    onAuctionDeleted,
    onConnectError,
    onSocketError,
    onReconnect,
  ]);

  const joinAuction = (targetAuctionId?: string) => {
    const socket = socketRef.current;
    const resolvedAuctionId = targetAuctionId || auctionId;
    if (!socket || !socket.connected || !resolvedAuctionId) return;
    socket.emit('joinAuction', { auctionId: resolvedAuctionId });
  };

  const leaveAuction = (targetAuctionId?: string) => {
    const socket = socketRef.current;
    const resolvedAuctionId = targetAuctionId || auctionId;
    if (!socket || !socket.connected || !resolvedAuctionId) return;
    socket.emit('leaveAuction', { auctionId: resolvedAuctionId });
  };

  const placeBid = async ({ auctionId: targetAuctionId, amount }: PlaceBidInput): Promise<PlaceBidAck> => {
    const socket = socketRef.current;
    if (!socket) {
      return { ok: false, error: 'Realtime connection is not ready. Please retry.' };
    }

    const connectionResult = await waitForSocketConnection(socket, CONNECT_TIMEOUT_MS);
    if (!connectionResult.ok) {
      return { ok: false, error: connectionResult.error };
    }

    socket.emit('joinAuction', { auctionId: targetAuctionId });

    return new Promise<PlaceBidAck>((resolve) => {
      let settled = false;

      const finish = (result: PlaceBidAck) => {
        if (settled) return;
        settled = true;
        socket.off('exception', handleException);
        socket.off('error', handleError);
        resolve(result);
      };

      const handleException = (payload: unknown) => {
        const message = parseEventErrorMessage(payload);
        if (!message) return;
        finish({ ok: false, error: message });
      };

      const handleError = (payload: unknown) => {
        const message = parseEventErrorMessage(payload);
        if (!message) return;
        finish({ ok: false, error: message });
      };

      socket.on('exception', handleException);
      socket.on('error', handleError);

      socket.timeout(BID_ACK_TIMEOUT_MS).emit(
        'placeBid',
        { auctionId: targetAuctionId, amount },
        (error: unknown, ack: unknown) => {
        if (settled) return;
        settled = true;
        socket.off('exception', handleException);
        socket.off('error', handleError);

        if (error) {
          const timeoutError = parseEventErrorMessage(error);
          resolve({ ok: false, error: timeoutError || 'Bid request timed out. Please try again.' });
          return;
        }

        const parsed = parsePlaceBidAck(ack);
        if (!parsed.ok && parsed.error.trim().toLowerCase() === 'timeout') {
          resolve({ ok: false, error: 'Bid request timed out. Please try again.' });
          return;
        }

        resolve(parsed);
      }
      );
    });
  };

  useEffect(() => {
    if (!auctionId || !socketUrl) return;

    const socket = io(socketUrl, {
      path: '/socket.io',
      autoConnect: false,
      transports: ['websocket'],
      auth: token ? { token } : undefined,
      query: token ? { token } : undefined,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      if (wasDisconnectedRef.current) {
        handlersRef.current.onReconnect?.();
        wasDisconnectedRef.current = false;
      }
      socket.emit('joinAuction', { auctionId });
    };

    const handleDisconnect = () => {
      wasDisconnectedRef.current = true;
    };

    const handleNewBid = (data: unknown) =>
      handlersRef.current.onNewBid?.(parseNewBidPayload(data, auctionId));
    const handleNotificationNew = (data: unknown) =>
      handlersRef.current.onNotificationNew?.(parseNotificationPayload(data, auctionId));
    const handleOutBid = (data: unknown) =>
      handlersRef.current.onOutBid?.(parseOutBidPayload(data, auctionId));
    const handleAuctionEnded = (data: unknown) =>
      handlersRef.current.onAuctionEnded?.(parseAuctionEndedPayload(data, auctionId));
    const handleAuctionWinnerChanged = (data: unknown) =>
      handlersRef.current.onAuctionWinnerChanged?.(
        parseAuctionWinnerChangedPayload(data, auctionId)
      );
    const handlePaymentConfirmed = (data: unknown) =>
      handlersRef.current.onPaymentConfirmed?.(parsePaymentConfirmedPayload(data, auctionId));
    const handleAuctionCancelled = (data: unknown) =>
      handlersRef.current.onAuctionCancelled?.(parseAuctionCancelledPayload(data, auctionId));
    const handleAuctionDeleted = (data: unknown) =>
      handlersRef.current.onAuctionDeleted?.(parseAuctionDeletedPayload(data, auctionId));
    const handleConnectError = (error: unknown) =>
      handlersRef.current.onConnectError?.(normalizeSocketError(error));
    const handleSocketError = (error: unknown) =>
      handlersRef.current.onSocketError?.(normalizeSocketError(error));

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('newBid', handleNewBid);
    socket.on('new-bid', handleNewBid);
    socket.on('notification:new', handleNotificationNew);
    socket.on('outBid', handleOutBid);
    socket.on('auctionEnded', handleAuctionEnded);
    socket.on('auctionWinnerChanged', handleAuctionWinnerChanged);
    socket.on('paymentConfirmed', handlePaymentConfirmed);
    socket.on('auctionCancelled', handleAuctionCancelled);
    socket.on('auctionDeleted', handleAuctionDeleted);
    socket.on('connect_error', handleConnectError);
    socket.on('error', handleSocketError);

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('newBid', handleNewBid);
      socket.off('new-bid', handleNewBid);
      socket.off('notification:new', handleNotificationNew);
      socket.off('outBid', handleOutBid);
      socket.off('auctionEnded', handleAuctionEnded);
      socket.off('auctionWinnerChanged', handleAuctionWinnerChanged);
      socket.off('paymentConfirmed', handlePaymentConfirmed);
      socket.off('auctionCancelled', handleAuctionCancelled);
      socket.off('auctionDeleted', handleAuctionDeleted);
      socket.off('connect_error', handleConnectError);
      socket.off('error', handleSocketError);
      socket.emit('leaveAuction', { auctionId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [auctionId, socketUrl, token]);

  return {
    socketRef,
    isConnected: () => Boolean(socketRef.current?.connected),
    joinAuction,
    leaveAuction,
    placeBid,
  };
};